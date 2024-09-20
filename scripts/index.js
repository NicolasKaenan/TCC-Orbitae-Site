const express = require('express');
const { user } = require('./user.js');
const banco = require('./banco.js');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  // Importa o cookie-parser
const { user_cookie } = require('./user_cookie.js');



const app = express();

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

        res.cookie('usuario', req.body.email, { maxAge: 5 * 3600 * 1000});

        const usuario_id = await user.findOne({
            where: { email: req.body.email,  password: req.body.senha }
        });
        
        await user_cookie.create({
            userId: usuario_id.id,
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
            res.cookie('usuario', req.body.email, { maxAge: 5 * 3600 * 1000});

            // Armazenar cookie no banco
            await user_cookie.create({
                userId: usuarioExistente.id,
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

