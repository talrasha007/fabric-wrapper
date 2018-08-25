const fs = require('fs');
const utils = require('../../');

const ordererCyrptoDir = __dirname + '/crypto-config/ordererOrganizations/example.com/users/Admin@example.com';
const org1CryptoDir = __dirname + '/crypto-config/peerOrganizations/org1.example.com/users';

module.exports = {
  clientForOrderer() {
    return utils.getClient({
      uuid: 'test-fabric-examples-tls',
      mspId: 'OrdererMSP',
      user: 'orderer-admin',
      privateKey: fs.readFileSync(ordererCyrptoDir + '/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(ordererCyrptoDir + '/msp/signcerts/Admin@example.com-cert.pem')
    });
  },

  clientForPeerAdmin() {
    return utils.getClient({
      uuid: 'test-fabric-examples-tls',
      mspId: 'Org1MSP',
      user: 'peer-org1-admin',
      privateKey: fs.readFileSync(org1CryptoDir + '/Admin@org1.example.com/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(org1CryptoDir + '/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem')
    });
  },

  clientForPeer() {
    return utils.getClient({
      uuid: 'test-fabric-examples-tls',
      mspId: 'Org1MSP',
      user: 'peer-org1-user',
      privateKey: fs.readFileSync(org1CryptoDir + '/User1@org1.example.com/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(org1CryptoDir + '/User1@org1.example.com/msp/signcerts/User1@org1.example.com-cert.pem')
    });
  },

  getOrderer(client) {
    return client.newOrderer(
      this.ordererOptions.url
    );
  },

  getPeers(client) {
    return this.peersOptions.map(po => client.newPeer(po.url, po.opts));
  },

  getChannel(client) {
    const channel = client.newChannel('my-channel');

    const orderer = this.getOrderer(client);
    channel.addOrderer(orderer);
    this.getPeers(client).forEach(channel.addPeer.bind(channel));

    return channel;
  },

  get ordererOptions() {
    return {
      url: 'grpc://localhost:7050'
    };
  },

  get peersOptions() {
    return [
      { url: 'grpc://localhost:7051' }
    ];
  },

  get channelTx() {
    return fs.readFileSync(__dirname + '/my_channel_tx.pb');
  }
};