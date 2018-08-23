const fs = require('fs');
const utils = require('../../');

module.exports = {
  fromCa() {
    return utils.getClient({
      uuid: 'test-fabric-examples-simple',
      mspId: 'SampleOrg',
      user: 'admin',
      password: 'adminpw',
      ca: {
        url: 'http://localhost:7054'
      }
    });
  },

  getOrdererClient() {
    return utils.getClient({
      uuid: 'test-fabric-examples-simple',
      mspId: 'SampleOrg',
      user: 'admin-orderer',
      privateKey: fs.readFileSync(__dirname + '/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(__dirname + '/msp/signcerts/peer.pem')
    });
  },

  get ordererOptions() {
    return {
      url: 'grpc://localhost:7050'
    };
  },

  get channelTx() {
    return fs.readFileSync(__dirname + '/my_channel_tx.pb');
  }
};