const sequelize = require("sequelize");
const banco = require("./banco");

const corpos = banco.conexao.define(
    "corpos",
    {
        id: {
            type: sequelize.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        nome:{
            type: sequelize.STRING,
            allowNull: false,
        },
        id_simulacao: {
            type: sequelize.INTEGER.UNSIGNED,
            allowNull: false,
        },
        massa: {
            type: sequelize.DOUBLE.UNSIGNED,
            allowNull: false,
        },
        cor: {
            type: sequelize.STRING,
            allowNull: false,
        },
        position_x: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        position_y: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        position_z: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        velocidade_x: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        velocidade_y: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        velocidade_z: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
    },
    { timestamps: false }
);

module.exports = corpos;
