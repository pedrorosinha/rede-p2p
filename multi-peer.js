const dgram = require('dgram');
const fs = require('fs');
const path = require('path');

const CHUNK_SIZE = 1024;
const END_SIGNAL = '__END__';

const peers = [
  { name: 'peer1', port: 5001 },
  { name: 'peer2', port: 5002 },
  { name: 'peer3', port: 5003 }
];

const servers = {};

// Criar e iniciar os peers (servidores UDP)
peers.forEach(currentPeer => {
  const server = dgram.createSocket('udp4');
  servers[currentPeer.name] = server;

  let chunks = [];
  let filename = '';

  server.on('message', (msg, rinfo) => {
    if (msg.toString().startsWith('__FILENAME__')) {
      filename = msg.toString().replace('__FILENAME__', '').trim();
      console.log(`[${currentPeer.name}] Nome do arquivo recebido: ${filename}`);
    } else if (msg.toString() === END_SIGNAL) {
      const outputDir = path.join(__dirname, 'received', currentPeer.name);
      fs.mkdirSync(outputDir, { recursive: true });

      const outputPath = path.join(outputDir, filename || 'arquivo-recebido.txt');
      const fileBuffer = Buffer.concat(chunks);
      fs.writeFileSync(outputPath, fileBuffer);
      console.log(`[${currentPeer.name}] Arquivo salvo como ${outputPath} (${fileBuffer.length} bytes)`);
      chunks = [];
      filename = '';
    } else {
      chunks.push(msg);
    }
  });

  server.bind(currentPeer.port, () => {
    console.log(`[${currentPeer.name}] Escutando na porta ${currentPeer.port}...`);

    // Após bind, aguarda 2s e dispara envio dos arquivos da pasta files/{peerName}
    setTimeout(() => {
      enviarArquivosDaPasta(currentPeer.name);
    }, 2000);
  });
});

// Função para enviar um arquivo de um peer para os outros
async function enviarArquivoDePeer(peerName, arquivoPath) {
  const sender = peers.find(p => p.name === peerName);
  if (!sender) {
    console.error(`Peer ${peerName} não encontrado.`);
    return;
  }

  if (!fs.existsSync(arquivoPath)) {
    console.error(`Arquivo ${arquivoPath} não encontrado.`);
    return;
  }

  const client = dgram.createSocket('udp4');
  const buffer = fs.readFileSync(arquivoPath);
  const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE);
  const fileName = path.basename(arquivoPath);

  const destinos = peers.filter(p => p.port !== sender.port);

  console.log(`[${sender.name}] Enviando ${fileName} para ${destinos.map(p => p.name).join(', ')}...`);

  destinos.forEach(dest => {
    // Envia nome do arquivo primeiro
    client.send(`__FILENAME__${fileName}`, dest.port, 'localhost');

    // Envia os chunks
    for (let i = 0; i < totalChunks; i++) {
      const chunk = buffer.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      client.send(chunk, dest.port, 'localhost');
    }

    // Sinaliza fim
    setTimeout(() => {
      client.send(END_SIGNAL, dest.port, 'localhost', () => {
        console.log(`[${sender.name}] Arquivo enviado para ${dest.name}`);
      });
    }, 300);
  });

  setTimeout(() => client.close(), 2000);
}

// Função para enviar todos arquivos da pasta files/{peerName}
function enviarArquivosDaPasta(peerName) {
  const dir = path.join(__dirname, 'files', peerName);
  if (!fs.existsSync(dir)) {
    console.log(`[${peerName}] Diretório ${dir} não existe. Nada a enviar.`);
    return;
  }

  const arquivos = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
  if (arquivos.length === 0) {
    console.log(`[${peerName}] Nenhum arquivo para enviar na pasta ${dir}`);
    return;
  }

  console.log(`[${peerName}] Enviando ${arquivos.length} arquivo(s) da pasta ${dir}`);

  arquivos.forEach(arquivo => {
    const arquivoCompleto = path.join(dir, arquivo);
    enviarArquivoDePeer(peerName, arquivoCompleto);
  });
}

// Função para listar arquivos recebidos de um peer
function listarArquivos(peerName) {
  const dir = path.join(__dirname, 'received', peerName);
  if (!fs.existsSync(dir)) {
    console.log(`[${peerName}] Diretório não encontrado.`);
    return;
  }
  const files = fs.readdirSync(dir);
  if (files.length === 0) {
    console.log(`[${peerName}] Nenhum arquivo encontrado.`);
  } else {
    console.log(`[${peerName}] Arquivos:`);
    files.forEach(f => console.log(` - ${f}`));
  }
}

// Função para deletar um arquivo de um peer
function deletarArquivo(peerName, filename) {
  const filePath = path.join(__dirname, 'received', peerName, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`[${peerName}] Arquivo ${filename} não existe.`);
    return;
  }
  fs.unlinkSync(filePath);
  console.log(`[${peerName}] Arquivo ${filename} deletado.`);
}

// Expor as funções para uso manual se quiser
module.exports = { enviarArquivoDePeer, listarArquivos, deletarArquivo };
