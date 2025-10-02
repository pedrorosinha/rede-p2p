# Sincronizador de Arquivos P2P (rede-p2p)

Este projeto é uma aplicação de sincronização de arquivos ponto-a-ponto (P2P) desenvolvida em **Node.js**.  
A aplicação simula uma pequena rede de **3 nós (peers)**, onde cada nó pode enviar e receber arquivos diretamente via **UDP sockets**.

---

## Funcionalidades

- **Sincronização via UDP**: Cada peer envia e recebe arquivos diretamente via UDP.
- **Organização local de arquivos**: Arquivos recebidos são salvos em pastas separadas para cada peer.
- **Suporte a UTF-8**: Lida corretamente com nomes de arquivos que contêm acentos e caracteres especiais.
- **Rede P2P Simples**: Três peers configurados para enviar arquivos uns para os outros em rede local.
---

## Estrutura de Pastas para Arquivos UDP

Os arquivos recebidos via UDP são salvos na pasta `files/` dentro do projeto, com subpastas para cada peer, por exemplo:
```bash
    files/peer1/arquivos

Versões recomendadas:

Node.js: v20.x ou superior (LTS recomendada)
npm: v9.x ou superior (geralmente vem junto com o Node.js)
Verifique suas versões com:

node -v
npm -v

## Instalação

Siga os passos abaixo para configurar o ambiente do projeto:

```bash
# Clone o repositório
git clone https://github.com/pedrorosinha/rede-p2p.git

# Navegue até a pasta do projeto
cd rede-p2p

# Instale as dependências
npm install

```bash
node multi-peer.js