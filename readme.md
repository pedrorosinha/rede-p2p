Sincronizador de Arquivos P2P (rede-p2p)
Este projeto é uma aplicação de sincronização de arquivos ponto-a-ponto (P2P) desenvolvida em Node.js e Express. A aplicação simula uma pequena rede de 3 nós (peers), onde cada um pode fazer upload, listar, deletar e sincronizar arquivos com os outros nós através de uma interface web simples.

Funcionalidades
Interface Web: Cada nó possui uma interface web para interagir com seus arquivos.

Upload de Arquivos: Envio de arquivos para o diretório de um nó específico.

Listagem e Exclusão: Visualização e exclusão de arquivos locais.

Sincronização: Um nó pode "puxar" arquivos novos ou atualizados de seus peers configurados.

Suporte a UTF-8: Lida corretamente com nomes de arquivos que contêm acentos e caracteres especiais.

Pré-requisitos
Para executar este projeto, você precisará ter o Node.js e o npm (Node Package Manager) instalados no seu sistema. As versões recomendadas são:

Node.js: v20.x ou superior (versão LTS recomendada).

npm: v9.x ou superior (geralmente vem instalado com o Node.js).

Você pode verificar suas versões com os seguintes comandos no terminal:

Bash

node -v
npm -v
Instalação
Siga os passos abaixo para configurar o ambiente do projeto:

Clone o repositório
Execute o comando abaixo no seu terminal para baixar os arquivos do projeto.

Bash

git clone https://github.com/pedrorosinha/rede-p2p.git
Navegue até a pasta do projeto

Bash

cd rede-p2p
Instale as dependências
Este comando lerá o arquivo package.json e instalará todas as bibliotecas necessárias (Express, Multer, etc.).

Bash

npm install
Como Rodar a Aplicação
A aplicação foi projetada para rodar 3 nós simultaneamente, cada um em sua própria porta e com seu próprio diretório de dados. O arquivo package.json já contém os scripts para facilitar esse processo.

Você precisará abrir 3 terminais separados, um para cada nó.

Terminal 1: Iniciando o Nó 1
Bash

npm run start:node1
O servidor será iniciado em http://localhost:5501.

Os arquivos serão salvos em data-node1/.

A inicialização deve mostrar no console o diretório que está sendo monitorado.

Terminal 2: Iniciando o Nó 2
Bash

npm run start:node2
O servidor será iniciado em http://localhost:5502.

Os arquivos serão salvos em data-node2/.

A inicialização deve mostrar no console o diretório que está sendo monitorado.

Terminal 3: Iniciando o Nó 3
Bash

npm run start:node3
O servidor será iniciado em http://localhost:5503.

Os arquivos serão salvos em data-node3/.

A inicialização deve mostrar no console o diretório que está sendo monitorado.

Acessando a Interface
Após iniciar os três nós, você pode acessar a interface de cada um no seu navegador:

Nó 1: http://localhost:5501

Nó 2: http://localhost:5502

Nó 3: http://localhost:5503

Para testar a sincronização, faça o upload de um arquivo em um dos nós (ex: no Nó 1) e, em seguida, acesse a interface de outro nó (ex: Nó 2) e clique no botão "Sincronizar". O arquivo do Nó 1 deverá aparecer na lista do Nó 2.

Estrutura do Projeto
/
├── data-node1/         # Diretório de arquivos para o Nó 1
├── data-node2/         # Diretório de arquivos para o Nó 2
├── data-node3/         # Diretório de arquivos para o Nó 3
├── public/             # Arquivos do frontend (HTML, CSS, JS)
│   ├── index.html
│   └── ...
├── config-node1.json   # Arquivo de configuração para o Nó 1
├── config-node2.json   # Arquivo de configuração para o Nó 2
├── config-node3.json   # Arquivo de configuração para o Nó 3
├── server.js           # O código principal do servidor (backend)
├── package.json        # Definições do projeto e dependências
└── README.md           # Este arquivo