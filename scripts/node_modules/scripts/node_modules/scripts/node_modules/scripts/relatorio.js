const sequelize = require("sequelize");
const banco = require("./banco");
const Corpo = require("./corpos");

var relatorio = banco.conexao.define(
    "relatorio",
    {
        id: {
            type: sequelize.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        id_corpo: {
            type: sequelize.INTEGER.UNSIGNED,
            references: {
                model: Corpo,
                key: 'id',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            allowNull: false,
        },
        nomeCorpo: {
            type: sequelize.STRING,
            allowNull: false,
        },
        massa: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        densidade: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        volume: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        raio: {
            type: sequelize.DOUBLE,
            allowNull: false,
        },
        quantidadeColisoes: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        velocidadeMediaX: {
            type: sequelize.DOUBLE,
            allowNull: true,
        },
        velocidadeMediaY: {
            type: sequelize.DOUBLE,
            allowNull: true,
        },
        velocidadeMediaZ: {
            type: sequelize.DOUBLE,
            allowNull: true,
        },
        cor: {
            type: sequelize.STRING,
            allowNull: true,
        },
    },
    { timestamps: false }
);

module.exports = relatorio;
