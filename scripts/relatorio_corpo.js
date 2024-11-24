const corpos = require('./corpos');
const relatorio = require('./relatorio');

relatorio.belongsTo(corpos, { foreignKey: 'id_corpo', onDelete: 'CASCADE' });
corpos.hasOne(relatorio, { foreignKey: 'id_corpo' });

module.exports = { corpos, relatorio };
