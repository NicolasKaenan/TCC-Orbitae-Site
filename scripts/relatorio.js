const sequelize = require("sequelize");
const banco = require("./banco")
const user = require("./corpo");
const { corpos } = require("./corpos");

var user = banco.conexao.define(    
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
        nome_simulacao:{
            type:sequelize.STRING,
            allowNull:false
        }
    },
    { timestamps: false }
)
corpos.corpos.belongsTo(relatorio)
relatorio.has
module.exports = {relatorio}