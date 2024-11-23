# CATEGORIAS-API

### Esse projeto foi construído usando Node com Typescript, Express, Database Postgres, TypeOrm, Rabbitmq, Docker e Docker-Compose e Jest para os testes.

#### Para executar o projeto localmente tenha o Docker e Docker-Compose instalado para gerênciar as depêndencias da nossa aplicação especificado pelos arquivos dockerfile e docker-compose.yml.

#### Passos para executar:
- #### Esse projeto foi aplicado: injeção e inversão de dependências, os repositórios usam um client do banco de dados criado respeitando uma interface definida para entradas e saídas de usos comuns do banco de dados, podendo substituir esse componente da aplicação por outro. Funções que faz: insert, update, delete foram separados para serem executados de forma assincrona com filas no rabbitmq. 
- ##### Acesso api em produção: **http://ec2-3-140-246-5.us-east-2.compute.amazonaws.com:3334/api-docs**
- ##### Baixe o projeto em seu diretório com o seguinte comando: **git clone https://github.com/ViniciusDes/categories-api.git**
- ##### Entre na pasta do projeto baixado com: **cd categories-api**
- ##### Foi deixado o arquivo **.env** não ignorado pelo git para ajudar a testar localmente
- ##### Execute o comando para executar a aplicação: **docker-compose up -d** ou **docker-compose up** para acompanhar os logs do container 
- ##### Para executar os testes execute o comando: **yarn test**
- ##### Para verificar e acessar a documentação da api, abra uma aba no navegador no endereço da aplicação: **http://localhost:3334/api-docs**
- ##### A infraestrutura da aplicação foi construida na AWS com serviços: EC2, RDS, MQ para gerênciar mensagens do o Rabbitmq


