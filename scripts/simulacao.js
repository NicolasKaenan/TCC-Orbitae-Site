const corpos = require("./corpos")
const sequelize = require("sequelize");
const banco = require("./banco")
const user = require("./user");

var simulacao = banco.conexao.define(
    "simulacao",
    {
        id:{
            type:sequelize.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement:true
        },
        id_user:{
            type:sequelize.INTEGER.UNSIGNED,
            allowNull:false
        },
        nome:{
            type:sequelize.STRING,
            allowNull:false
        },
        cor:{
            type:sequelize.STRING,
            allowNull:false
        }
    },
    { timestamps: false }
)

simulacao.hasMany(corpos,{foreignKey: 'id_simulacao'})

module.exports = {simulacao}