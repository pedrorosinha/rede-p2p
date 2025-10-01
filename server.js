'use strict';

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const express = require('express');
const multer = require('multer');
const { pipeline } = require('stream');
const { Readable } = require('stream');
const fetch = require('node-fetch'); 

// Pega o argumento --config
const configArgIndex = process.argv.indexOf('--config');
let config = {
  port: 5501,
  dir: './sync',
  peers: []
};

if (configArgIndex !== -1 && process.argv[configArgIndex + 1]) {
  const configPath = path.resolve(process.argv[configArgIndex + 1]);
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    console.error(`Arquivo de config não encontrado: ${configPath}`);
    process.exit(1);
  }
}

const app = express();
fs.mkdirSync(config.dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.dir),
  filename: (req, file, cb) => {
    const decodedFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, path.basename(decodedFileName));
  }
});
const upload = multer({ storage });

function isSafeName(name) {
  return !name.includes('/') && !name.includes('\\') && name === path.basename(name);
}

function filePath(name) { return path.join(config.dir, name); }

async function listLocalFiles() {
  const names = await fsp.readdir(config.dir);
  const out = [];
  for (const name of names) {
    if (name.includes('.tmp-')) continue;
    const full = filePath(name);
    const st = await fsp.stat(full);
    if (!st.isFile()) continue;
    out.push({
      name: name,
      size: st.size,
      mtimeMs: st.mtimeMs
    });
  }
  return out;
}

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/status', (req, res) => res.json({ port: config.port, dir: config.dir, peers: config.peers }));
app.get('/api/files', async (req, res) => {
  try { res.json({ files: await listLocalFiles() }); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/files/:name', async (req, res) => {
  // O Express já decodifica os parâmetros da URL (ex: %C3%A7 -> ç)
  const name = req.params.name;
  if (!isSafeName(name)) return res.status(400).send('Nome inválido');
  const full = filePath(name);
  try {
    const st = await fsp.stat(full);
    if (!st.isFile()) return res.status(404).send('Não encontrado');
    res.setHeader('Content-Length', st.size);
    res.setHeader('Last-Modified', new Date(st.mtimeMs).toUTCString());
    fs.createReadStream(full).pipe(res);
  } catch { res.status(404).send('Não encontrado'); }
});

app.delete('/api/files/:name', async (req, res) => {
  let name;
  try {
    name = decodeURIComponent(req.params.name);
  } catch (e) {
    // Se a decodificação falhar, é um nome inválido
    return res.status(400).json({ error: 'Nome de arquivo inválido.' });
  }

  if (!isSafeName(name)) {
    return res.status(400).json({ error: 'Nome de arquivo inseguro.' });
  }

  const full = filePath(name);
  try {
    await fsp.unlink(full);
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'ENOENT') {
      return res.status(404).json({ error: 'Arquivo não encontrado.' });
    }
    // Outros erros são erros de servidor
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  // Retorna o nome do arquivo já corrigido
  res.json({ ok: true, name: req.file.filename, size: req.file.size });
});

app.post('/api/sync/trigger', async (req, res) => {
  console.log('Sincronização iniciada...');

  try {
    // 1. Pega a lista de arquivos locais deste nó
    const localFiles = await listLocalFiles();
    const localFilesMap = new Map(localFiles.map(f => [f.name, f]));
    console.log(`Este nó (${config.port}) tem ${localFiles.length} arquivos.`);

    // 2. Itera sobre a lista de outros nós (peers)
    for (const peer of config.peers) {
      try {
        console.log(`Sincronizando com o peer: ${peer}`);

        // 3. Pede a lista de arquivos do peer
        const response = await fetch(`${peer}/api/files`);
        if (!response.ok) {
          console.error(`Erro ao buscar arquivos do peer ${peer}: ${response.statusText}`);
          continue; // Pula para o próximo peer
        }
        const peerData = await response.json();
        const peerFiles = peerData.files;

        // 4. Compara os arquivos e baixa o que for necessário
        for (const peerFile of peerFiles) {
          const localFile = localFilesMap.get(peerFile.name);

          // Condição para baixar:
          // - O arquivo não existe localmente, OU
          // - O arquivo do peer é mais recente que o local
          if (!localFile || peerFile.mtimeMs > localFile.mtimeMs) {
            console.log(`Baixando arquivo "${peerFile.name}" do peer ${peer}...`);

            const downloadUrl = `${peer}/api/files/${encodeURIComponent(peerFile.name)}`;
            const fileResponse = await fetch(downloadUrl);

            if (fileResponse.ok) {
              const destPath = filePath(peerFile.name);
              // Usamos um pipeline para salvar o arquivo de forma segura
              await pipeline(fileResponse.body, fs.createWriteStream(destPath));
              console.log(`Arquivo "${peerFile.name}" baixado com sucesso.`);
            } else {
              console.error(`Falha ao baixar "${peerFile.name}" do peer ${peer}.`);
            }
          }
        }
      } catch (e) {
        console.error(`Falha na comunicação com o peer ${peer}:`, e.message);
      }
    }

    console.log('Sincronização concluída.');
    res.json({ ok: true, message: 'Sincronização concluída.' });

  } catch (error) {
    console.error('Erro geral durante a sincronização:', error);
    res.status(500).json({ error: 'Falha ao sincronizar', details: error.message });
  }
});

app.listen(config.port, () => {
  console.log(`Servidor P2P rodando em http://localhost:${config.port}`);
});