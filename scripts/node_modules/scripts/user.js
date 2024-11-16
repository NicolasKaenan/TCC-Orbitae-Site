const sequelize = require("sequelize");
const banco = require("./banco")
const user_cookie = require("./user_cookie")
const simulacao = require("./simulacao")

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
user_cookie.user_cookie.belongsTo(user, { foreignKey: 'id_user' });
user.hasMany(user_cookie.user_cookie, { foreignKey: 'id_user' });
simulacao.simulacao.belongsTo(user, { foreignKey: 'id_user' });
user.hasMany(simulacao.simulacao, { foreignKey: 'id_user' });


module.exports = {user}