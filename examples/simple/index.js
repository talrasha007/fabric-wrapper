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

  getOrderer(client) {
    return client.newOrderer(
      this.ordererOptions.url
    );
  },

  getChannel(client) {
    const channel = client.newChannel('my-channel');

    const orderer = this.getOrderer(client);
    channel.addOrderer(orderer);

    this.peersOptions.forEach(po => {
      channel.addPeer(client.newPeer(po.url, po.opts));
    });

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