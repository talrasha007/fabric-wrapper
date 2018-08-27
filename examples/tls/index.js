const fs = require('fs');
const utils = require('../../');

const cryptoConfigDir = __dirname + '/crypto-config';
const org1Domain = 'org1.example.com';

module.exports = {
  clientForPeerAdmin() {
    const adminMsp = utils.crypto.mspFromCryptoGen(cryptoConfigDir, org1Domain, 'Admin');

    return utils.getClient({
      uuid: 'test-fabric-examples-tls',
      mspId: 'Org1MSP',
      user: 'peer-org1-admin',
      ...adminMsp
    });
  },

  clientForPeer() {
    const userMsp = utils.crypto.mspFromCryptoGen(cryptoConfigDir, org1Domain, 'User1');

    return utils.getClient({
      uuid: 'test-fabric-examples-tls',
      mspId: 'Org1MSP',
      user: 'peer-org1-user',
      ...userMsp
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