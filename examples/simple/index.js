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

  fromFile() {
    return utils.getClient({
      uuid: 'test-fabric-examples-simple',
      mspId: 'SampleOrg',
      user: 'admin',
      privateKey: fs.readFileSync(__dirname + '/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(__dirname + '/msp/signcerts/peer.pem')
    });
  }
};