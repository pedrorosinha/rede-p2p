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
  });
});

// Função para enviar arquivo MANUALMENTE de um peer para os outros
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

// Expor a função para o console (no Node REPL)
module.exports = { enviarArquivoDePeer };
