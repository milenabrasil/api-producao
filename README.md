# API de Produção

API REST completa com boas práticas de produção, variáveis de ambiente e tratamento global de erros.

## Tecnologias

- Node.js
- Express
- MySQL
- JWT (JSON Web Token)
- Bcrypt
- Dotenv

## Funcionalidades

- Cadastro e login de usuários
- Senha criptografada com Bcrypt
- Autenticação com JWT
- CRUD completo de tarefas por usuário
- Variáveis de ambiente com dotenv
- Tratamento global de erros
- Rotas protegidas por autenticação

## Como rodar

### Instalação

```bash
npm install
```

### Configurar o .env

Crie um arquivo `.env` na raiz do projeto:

```
PORT=3000
JWT_SECRET=seu_segredo_aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=api_producao
```

### Configurar o banco

```sql
CREATE DATABASE api_producao;
USE api_producao;
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);
CREATE TABLE tarefas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    concluida BOOLEAN DEFAULT FALSE,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

### Rodar o servidor

```bash
node server.js
```

## Rotas

### Autenticação

| Método | Rota      | Descrição         | Auth |
| ------ | --------- | ----------------- | ---- |
| POST   | /cadastro | Cadastrar usuário | ❌   |
| POST   | /login    | Fazer login       | ❌   |

### Tarefas

| Método | Rota         | Descrição                 | Auth |
| ------ | ------------ | ------------------------- | ---- |
| GET    | /tarefas     | Listar tarefas do usuário | ✅   |
| GET    | /tarefas/:id | Buscar tarefa por id      | ✅   |
| POST   | /tarefas     | Criar tarefa              | ✅   |
| PUT    | /tarefas/:id | Atualizar tarefa          | ✅   |
| DELETE | /tarefas/:id | Deletar tarefa            | ✅   |

## Como autenticar

```
Authorization: Bearer SEU_TOKEN_AQUI
```
