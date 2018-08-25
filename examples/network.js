const simple = require('./simple');
const tls = require('./tls');

const networks = { tls, simple };

module.exports = networks[process.env.NETWORK] || tls;