const fs = require('fs');
const utils = require('../../');

module.exports = {
  clientForOrderer() {
    return utils.getClient({
      uuid: 'test-fabric-examples-simple',
      mspId: 'SampleOrg',
      user: 'orderer-admin',
      privateKey: fs.readFileSync(__dirname + '/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(__dirname + '/msp/signcerts/peer.pem')
    });
  },

  clientForPeerAdmin() {
    return utils.getClient({
      uuid: 'test-fabric-examples-simple',
      mspId: 'SampleOrg',
      user: 'peer-admin',
      privateKey: fs.readFileSync(__dirname + '/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(__dirname + '/msp/signcerts/peer.pem')
    });
  },

  clientForPeer() {
    return utils.getClient({
      uuid: 'test-fabric-examples-simple',
      mspId: 'SampleOrg',
      user: 'peer-user',
      privateKey: fs.readFileSync(__dirname + '/msp/keystore/key.pem'),
      signedCert: fs.readFileSync(__dirname + '/msp/signcerts/peer.pem')
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