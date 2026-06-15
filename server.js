const express = require('express')
const mysql = require('mysql2/promise')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()  // carrega o .env

const app = express()
const PORT = process.env.PORT

app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET

let db

async function iniciar() {
    db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })

    console.log('Conectado ao banco!')

    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`)
    })
}

function autenticar(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ erro: 'Token não enviado' })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)
        req.usuario = decoded
        next()
    } catch (erro) {
        return res.status(401).json({ erro: 'Token inválido' })
    }
}

// Suas rotas vão aqui
app.post('/cadastro', async (req, res, next) => {
    try {
        const { nome, email, senha } = req.body

        if (!nome || !email || !senha) {
            return res.status(400).json({ mensagem: 'Todos os campos precisam ser preenchidos' })
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const [usuario] = await db.execute(
            'INSERT INTO usuarios (nome,email,senha) VALUES (?,?,?)', [nome, email, senhaCriptografada]
        )

        const [retornoUsuario] = await db.execute(
            'SELECT id, nome, email FROM usuarios WHERE id=?',
            [usuario.insertId]
        )
        res.status(201).json(retornoUsuario[0])

    } catch (erro) {
        next(erro)  // passa o erro pro middleware de erro
    }
})

app.post('/login', async (req, res, next) => {
    try {
        const { email, senha } = req.body
        if (!email || !senha) {
            return res.status(400).json({ mensagem: 'Todos os campos precisam ser preenchidos' })
        }

        const [usuario] = await db.execute(
            'SELECT id,email,senha FROM usuarios WHERE email=?',
            [email]
        )
        if (!usuario[0]) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado' })
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario[0].senha)

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: 'Usuário não autenticado' })
        }

        const token = jwt.sign(
            { id: usuario[0].id, email: usuario[0].email },
            JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.json({ token: token })

    } catch (erro) {
        next(erro)  // passa o erro pro middleware de erro
    }
})

app.post('/tarefas', autenticar, async (req, res, next) => {
    try {
        const { titulo, descricao } = req.body
        const idUsuario = req.usuario.id

        if (!titulo) {
            return res.status(400).json({ mensagem: 'O título é obrigatório' })
        }

        const [tarefa] = await db.execute(
            'INSERT INTO tarefas (titulo,descricao,usuario_id) VALUES (?,?,?)',
            [titulo, descricao, idUsuario]
        )

        const [verificarTarefa] = await db.execute(
            'SELECT * from tarefas WHERE id=?',
            [tarefa.insertId]
        )

        res.status(201).json(verificarTarefa[0])

    } catch (erro) {
        next(erro)  // passa o erro pro middleware de erro
    }
})

app.get('/tarefas', autenticar, async (req, res, next) => {
    try {
        const idUsuario = req.usuario.id

        const [tarefa] = await db.execute(
            'SELECT * FROM tarefas WHERE usuario_id=?',
            [idUsuario]
        )

        if (!tarefa[0]) {
            return res.json({ mensagem: 'Este usuário não possui tarefa' })
        }

        res.json(tarefa)

    } catch (erro) {
        next(erro)  // passa o erro pro middleware de erro
    }
})

app.get('/tarefas/:id', autenticar, async (req, res, next) => {
    try {
        const idUsuario = req.usuario.id
        const id = req.params.id

        const [tarefa] = await db.execute(
            'SELECT * FROM tarefas WHERE id=? AND usuario_id=?',
            [id, idUsuario]
        )

        if (!tarefa[0]) {
            return res.status(404).json({ mensagem: 'Tarefa não encontrada' })
        }

        res.json(tarefa[0])

    } catch (erro) {
        next(erro)  // passa o erro pro middleware de erro
    }
})

app.delete('/tarefas/:id', autenticar, async (req, res, next) => {
    try {
        const id = req.params.id
        const idUsuario = req.usuario.id

        const [tarefa] = await db.execute(
            'SELECT * FROM tarefas WHERE id=? AND usuario_id=?',
            [id, idUsuario]
        )

        if (!tarefa[0]) {
            return res.status(404).json({ mensagem: 'Tarefa não encontrada' })
        }

        const [deletarTarefa] = await db.execute(
            'DELETE FROM tarefas WHERE id=? AND usuario_id=?',
            [id, idUsuario]
        )

        res.json({ mensagem: 'Tarefa deletada com sucesso' })


    } catch (erro) {
        next(erro)  // passa o erro pro middleware de erro
    }
})

app.put('/tarefas/:id', autenticar, async (req, res, next) => {
    try {
        const id = req.params.id
        const idUsuario = req.usuario.id
        const { titulo, descricao } = req.body

        const [tarefa] = await db.execute(
            'SELECT * FROM tarefas WHERE id=? AND usuario_id=?',
            [id, idUsuario]
        )

        if (!tarefa[0]) {
            return res.status(404).json({ mensagem: 'Tarefa não encontrada' })
        }

        const tituloNovo = titulo || tarefa[0].titulo
        const descricaoNovo = descricao || tarefa[0].descricao

        const [atualizarTarefa] = await db.execute(
            'UPDATE tarefas SET titulo=?, descricao=? WHERE id=? AND usuario_id=?',
            [tituloNovo, descricaoNovo, id, idUsuario]
        )

        // adiciona esse SELECT depois do UPDATE
        const [retornoTarefa] = await db.execute(
            'SELECT * FROM tarefas WHERE id=? AND usuario_id=?',
            [id, idUsuario]
        )

        return res.json(retornoTarefa[0])  // retorna a tarefa atualizada

    } catch (erro) {
        next(erro)  // passa o erro pro middleware de erro
    }
})

// precisa ficar depois de todas as rotas
app.use((erro, req, res, next) => {
    console.error(erro)

    res.status(500).json({
        erro: 'Erro interno do servidor',
        mensagem: erro.message
    })
})


iniciar()