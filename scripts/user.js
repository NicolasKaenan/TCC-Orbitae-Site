const sequelize = require("sequelize");
const banco = require("./banco")
const user_cookie = require("./user_cookie")

var user = banco.conexao.define(    
    "user",
    {
        id:{
            type:sequelize.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement:true
        },
        username:{
            type:sequelize.STRING,
            allowNull:false
        },
        email:{
            type:sequelize.STRING,
            allowNull:false
        },
        password:{
            type:sequelize.STRING,
            allowNull:false
        }
    },
    { timestamps: false }
)
user_cookie.user_cookie.belongsTo(user)
user.hasMany(user_cookie.user_cookie)

module.exports = {user}