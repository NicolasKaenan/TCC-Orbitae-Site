const sequelize = require("sequelize");
const banco = require("./banco")
const simulacao = require("./simulacao");
const { corpos } = require("./corpos");

var relatorio = banco.conexao.define(    
    "relatorio",
    {
        id:{
            type:sequelize.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement:true
        },
        id_corpo:{
            type:sequelize.INTEGER.UNSIGNED,
            allowNull:false
        },
        colisao:{
            type:sequelize.INTEGER,
            allowNull:false
        },
        quantideda_corpos:{
            type:sequelize.INTEGER,
            allowNull:false
        },
        id_simulacao:{
            type:sequelize.STRING,
            allowNull:false
        }
    },
    { timestamps: false }
)
