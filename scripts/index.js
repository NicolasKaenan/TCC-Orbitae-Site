const express = require('express');
const { user } = require('./user.js');
const banco = require('./banco.js');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  // Importa o cookie-parser
const { user_cookie } = require('./user_cookie.js');
const { simulacao } = require('./simulacao.js')
const corpos = require("./corpos") 
var id_userlocal;
const { relatorio } = require('./relatorio.js')
const cors = require('cors')


const app = express();
app.use(cors());

app.use(cors({
    origin: 'http://127.0.0.1:5500', // Indica quem pode se conectar 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true, // Permite cookies e cabeçalhos de autorização
    allowedHeaders: ['Content-Type', 'Authorization'] // Liste os cabeçalhos que você espera receber
}));


app.use(express.json());
banco.conexao.sync(function () {
    console.log("Conectou com o banco de dados.");
});

const PORTA = 3000;

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(session({
    secret: 'orbitae',
    resave: false,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));

app.listen(PORTA, function () {
    console.log("Servidor iniciado na porta " + PORTA);
});

app.post('/', async (req, res) => {
    try {
        const usuarioExistente = await user.findOne({
            where: { email: req.body.email }
        });

        if (usuarioExistente) {
            console.log("Usuário já existe");
            return res.redirect("http://localhost:5500/pages/login.html");
        }

        const novoUsuario = await user.create({
            username: req.body.nome,
            email: req.body.email,
            password: req.body.senha
        });

        req.session.login = req.body.email;

        res.cookie('usuario', req.body.email, { maxAge: 5 * 3600 * 1000 });

        const usuario_id = await user.findOne({
            where: { email: req.body.email, password: req.body.senha }
        });

        await user_cookie.create({
            id_user: usuario_id.id,
            cookie: req.body.email
        });


        // Chama a API externa usando fetch
        const response = await fetch('http://localhost:8080/auth/retorno-login?' + encodeURIComponent(req.body.email), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `usuario=${req.body.email}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao comunicar com a API externa');
        }

        // Redireciona para a página de sucesso
        return res.redirect("http://localhost:5500/pages/index.html");

    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro no servidor');
    }
});

app.post('/login', async (req, res) => {
    console.log("Iniciando login");

    try {
        const usuarioExistente = await user.findOne({
            where: { email: req.body.email, password: req.body.senha }
        });

        if (usuarioExistente) {
            req.session.login = req.body.email;

            // Criando cookie
            res.cookie('usuario', req.body.email, { maxAge: 5 * 3600 * 1000 });

            // Armazenar cookie no banco
            await user_cookie.create({
                id_user: usuarioExistente.id,
                cookie: req.body.email
            });

            // Chama a API externa usando fetch
            const response = await fetch(`http://localhost:8080/auth/retorno-login?${encodeURIComponent(req.body.email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `usuario=${req.body.email}`
                }
            });
            id_userlocal = usuarioExistente.id 
            if (!response.ok) {
                throw new Error('Erro ao comunicar com a API externa');
            }

            // Redireciona para a página de sucesso
            return res.redirect("http://localhost:5500/pages/index.html");
        } else {
            console.log("Usuário não encontrado");
            return res.redirect("http://localhost:5500/pages/register.html");
        }
    } catch (error) {
        console.error("Erro durante o login:", error);
        return res.status(500).send('Erro no servidor');
    }
});

app.post('/simulation', async (req, res) => {
    try {
        // Receber os dados do corpo da requisição
        const { nome, cor, cookie_user } = req.body;

        // Lidar com o dado recebido
        console.log('nome:', nome);
        console.log('cor:', cor);
        console.log('cookie_user:', cookie_user);

        // Buscar o usuário no banco de dados
        const resultado = await user_cookie.findAll({
            where: { cookie: cookie_user }
        });

        if (!resultado) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Criar a simulação
        await simulacao.create({
            id_user: resultado[0].id_user,
            nome: nome,
            cor: cor
        });

        // Retornar uma resposta
        res.status(200).json({ message: 'Dados recebidos e simulação criada com sucesso' });
    } catch (error) {
        console.error('Erro ao processar os dados:', error);
        res.status(500).json({ message: 'Erro ao processar os dados' });
    }
});

app.get("/simulation/:cookie", async (req, res) => {
    try {
        // Pegue o valor do cookie da URL
        const cookie = req.params.cookie;
        
        // Consulte o banco de dados com o cookie
        const resultado = await user_cookie.findAll({
            where: { cookie: cookie } // Use o valor do cookie
        });

        // Verifique se encontrou algum resultado
        if (!resultado || resultado.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Use o id_user do resultado para buscar as simulações
        const resultado2 = await simulacao.findAll({
            where: { id_user: resultado[0].id_user }
        });

        // Retorne as simulações
        return res.status(200).json(resultado2);

    } catch (error) {
        // Lidar com erros e enviar uma resposta de erro
        console.error(error);
        return res.status(500).json({ error: "Erro no servidor." });
    }
});

app.delete("/simulation/:id", async (req,res)=>{
    const resultado = await simulacao.destroy({
        where: {
            id: req.params.id
        }
    })
    if (resultado == 0) {
        res.status(404).send({})
    } else {
        res.status(204).send({})
    }
});


