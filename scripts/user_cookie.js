const sequelize = require("sequelize");
const banco = require("./banco")
const user = require("./user");
const { FOREIGNKEYS } = require("sequelize/lib/query-types");

var user_cookie = banco.conexao.define(
    "user_cookie",
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
        cookie:{
            type:sequelize.STRING,
            allowNull:false
        }
    },
    { timestamps: false }
)


module.exports = {user_cookie}