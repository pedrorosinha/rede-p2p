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
