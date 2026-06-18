# API de Estoque

API REST para gerenciamento de produtos de uma loja, com autenticação de funcionários.

## Tecnologias
- Node.js
- Express
- MySQL
- JWT (JSON Web Token)
- Bcrypt
- Dotenv

## Funcionalidades
- Cadastro e login de funcionários
- Senha criptografada com Bcrypt
- Autenticação com JWT
- CRUD completo de produtos
- Qualquer pessoa pode visualizar produtos
- Apenas funcionários autenticados podem criar, editar e deletar produtos
- Tratamento global de erros

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
DB_NAME=estoque
```

### Configurar o banco
```sql
CREATE DATABASE estoque;
USE estoque;
CREATE TABLE funcionario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);
CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    quantidade INT NOT NULL,
    funcionario_id INT,
    FOREIGN KEY (funcionario_id) REFERENCES funcionario(id)
);
```

### Rodar o servidor
```bash
node server.js
```

## Rotas

### Autenticação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | /cadastro | Cadastrar funcionário | ❌ |
| POST | /login | Fazer login | ❌ |

### Funcionários
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| PUT | /funcionario/:id | Atualizar funcionário | ✅ |
| DELETE | /funcionario/:id | Deletar funcionário | ✅ |

### Produtos
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | /produto | Listar todos os produtos | ❌ |
| GET | /produto/:id | Buscar produto por id | ❌ |
| POST | /produto | Criar produto | ✅ |
| PUT | /produto/:id | Atualizar produto | ✅ |
| DELETE | /produto/:id | Deletar produto | ✅ |

## Como autenticar
```
Authorization: Bearer SEU_TOKEN_AQUI
```