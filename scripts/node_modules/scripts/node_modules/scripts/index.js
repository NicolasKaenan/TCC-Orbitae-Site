const express = require('express');
const { user } = require('./user.js');
const banco = require('./banco.js');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  // Importa o cookie-parser
const { user_cookie } = require('./user_cookie.js');
const { simulacao } = require('./simulacao.js')
const { corpos, relatorio } = require('./relatorio_corpo.js');

var id_userlocal;
const cors = require('cors')


const app = express();
app.use(cors());
app.use(express.json());


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

        if (!resultado || resultado.length === 0) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Criar a simulação
        const novaSimulacao = await simulacao.create({
            id_user: resultado[0].id_user,
            nome: nome,
            cor: cor
        });

        // Retornar o ID da simulação criada
        res.status(200).json({
            message: 'Simulação criada com sucesso',
            id: novaSimulacao.id // Captura o ID retornado pelo Sequelize
        });
    } catch (error) {
        console.error('Erro ao processar os dados:', error);
        res.status(500).json({ message: 'Erro ao processar os dados' });
    }
});

app.get("/relatorio/:id", async (req, res) => {
    try {
        const corpo_id = parseInt(req.params.id);

        const relatorio_corpo = await relatorio.findOne({
            where: { id_corpo: corpo_id }
        })

        res.status(200).json(relatorio_corpo)
    }catch(error){

    }
})

app.get("/corpos/simulation/:id", async (req, res) => {
    const simulacaoId = parseInt(req.params.id);

    try {
        const corposLista = await corpos.findAll({
            where: { id_simulacao: simulacaoId }, include: [
                {
                    model: relatorio,
                    as: 'relatorio',
                },
            ],
        });

        if (corposLista.length > 0) {
            res.status(200).json(corposLista);
        } else {
            res.status(404).json({ message: "Nenhum corpo encontrado para essa simulação." });
        }
    } catch (error) {
        console.error("Erro ao buscar os corpos:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

app.put("/relatorio/:id", async (req, res) => {
    const relatorio = relatorio.findOne({
        where: { id_simulacao: req.params.id }
    });
    if (relatorio) {
        const relatoriNovo = relatorio.update({
            id: relatorio.id,

        })
    }
});

app.put("/corpos/:id", async (req, res) => {
    const simulacaoId = parseInt(req.params.id);
    const listaCorpos = req.body;

    if (!Array.isArray(listaCorpos)) {
        return res.status(400).json({ message: "O corpo da requisição deve ser uma lista de corpos." });
    }

    let atualizados = 0;
    let criados = 0;

    try {
        for (const novoCorpo of listaCorpos) {
            if (novoCorpo.id === -1) {

                const corpo = await corpos.create({
                    id_simulacao: simulacaoId,
                    nome: novoCorpo.nome,
                    massa: novoCorpo.massa,
                    cor: novoCorpo.cor,
                    raio: novoCorpo.raio,
                    position_x: novoCorpo.position_x,
                    position_y: novoCorpo.position_y,
                    position_z: novoCorpo.position_z,
                    velocidade_x: novoCorpo.velocidade_x,
                    velocidade_y: novoCorpo.velocidade_y,
                    velocidade_z: novoCorpo.velocidade_z
                });

                await relatorio.create({
                    id_corpo: corpo.id,
                    nomeCorpo: novoCorpo.nome,
                    massa: novoCorpo.massa,
                    densidade: novoCorpo.relatorio.densidade,
                    volume: novoCorpo.relatorio.volume,
                    raio: novoCorpo.raio,
                    quantidadeColisoes: novoCorpo.relatorio.quantidadeColisoes || 0,
                    velocidadeMediaX: novoCorpo.relatorio.velocidadeMediaX,
                    velocidadeMediaY: novoCorpo.relatorio.velocidadeMediaY,
                    velocidadeMediaZ: novoCorpo.relatorio.velocidadeMediaZ,
                    cor: novoCorpo.cor,
                });

                criados++;
            } else {

                const corpo = await corpos.findOne({
                    where: { id: novoCorpo.id, id_simulacao: simulacaoId }
                });

                if (corpo) {
                    await corpos.update({
                        massa: novoCorpo.massa,
                        cor: novoCorpo.cor,
                        position_x: novoCorpo.position_x,
                        position_y: novoCorpo.position_y,
                        position_z: novoCorpo.position_z,
                        velocidade_x: novoCorpo.velocidade_x,
                        velocidade_y: novoCorpo.velocidade_y,
                        velocidade_z: novoCorpo.velocidade_z
                    }, {
                        where: { id: novoCorpo.id, id_simulacao: simulacaoId }
                    });

                    await relatorio.update({
                        nomeCorpo: novoCorpo.nome,
                        massa: novoCorpo.massa,
                        densidade: novoCorpo.relatorio.densidade,
                        volume: novoCorpo.relatorio.volume,
                        raio: novoCorpo.raio,
                        quantidadeColisoes: novoCorpo.relatorio.quantidadeColisoes || 0,
                        velocidadeMediaX: novoCorpo.relatorio.velocidadeMediaX,
                        velocidadeMediaY: novoCorpo.relatorio.velocidadeMediaY,
                        velocidadeMediaZ: novoCorpo.relatorio.velocidadeMediaZ,
                        cor: novoCorpo.cor,
                    }, {
                        where: { id_corpo: novoCorpo.id }
                    });

                    atualizados++;
                } else {
                    return res.status(404).json({ message: `Corpo com ID ${novoCorpo.id} não encontrado.` });
                }
            }
        }

        return res.status(200).json({
            message: "Processamento concluído.",
            atualizados,
            criados,
        });
    } catch (error) {
        console.error("Erro ao processar corpos e relatórios:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});



app.get("/simulation/:cookie", async (req, res) => {
    try {
        const cookie = req.params.cookie;

        const resultado = await user_cookie.findAll({
            where: { cookie: cookie }
        });

        if (!resultado || resultado.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const resultado2 = await simulacao.findAll({
            where: { id_user: resultado[0].id_user }
        });

        return res.status(200).json(resultado2);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro no servidor." });
    }
});

app.delete("/simulation/:id", async (req, res) => {
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


