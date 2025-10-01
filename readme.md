# Sincronizador de Arquivos P2P (rede-p2p)

Este projeto é uma aplicação de sincronização de arquivos ponto-a-ponto (P2P) desenvolvida em **Node.js** e **Express**.  
A aplicação simula uma pequena rede de **3 nós (peers)**, onde cada nó pode fazer **upload**, **listar**, **deletar** e **sincronizar arquivos** com os outros nós através de uma interface web simples.

---

## Funcionalidades

- **Interface Web**: Cada nó possui uma interface web para interagir com seus arquivos.
- **Upload de Arquivos**: Envio de arquivos para o diretório de um nó específico.
- **Listagem e Exclusão**: Visualização e exclusão de arquivos locais.
- **Sincronização**: Um nó pode "puxar" arquivos novos ou atualizados de seus peers configurados.
- **Suporte a UTF-8**: Lida corretamente com nomes de arquivos que contêm acentos e caracteres especiais.

---

## Pré-requisitos

Para executar este projeto, você precisará ter o **Node.js** e o **npm (Node Package Manager)** instalados no seu sistema.  

Versões recomendadas:

- **Node.js**: v20.x ou superior (LTS recomendada)
- **npm**: v9.x ou superior (geralmente vem junto com o Node.js)

Verifique suas versões com:

```bash
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


## Execução

Abra 3 terminais e rode:

# Terminal 1
```bash
npm run start:node1

# Terminal 2
```bash
npm run start:node2

# Terminal 3
```bash
npm run start:node3


## Para criar um node

# 1. Cria o arquivo config-node{valor}.json
```bash {
  "port": 5502,
  "dir": "c:\\Users\\pedro\\trabalho-p2p\\data-node2",
  "peers": [
    "http://localhost:5501",
    "http://localhost:5503"
  ]
}

**Obs: Configurar o camiinho do diretório**

# 2. Ajusta o package.json para criar um script 
# Exemplo
```bash "start:node{valor}": "node server.js --config config-node{valor}.json"