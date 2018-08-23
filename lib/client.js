const FabricClient = require('fabric-client');
const Channel = require('./channel');

class Client extends FabricClient {
  constructor() {
    super();
  }

  newChannel(name) {
    if (this._channels.get(name)) throw new Error(`Channel ${name} already exists`);

    const channel = new Channel(name, this);
    this._channels.set(name, channel);
    return channel;
  }

  async createChannel(orderer, name, envelope, extraSignatures) {
    const config = this.extractChannelConfig(envelope);
    const signatures = [this.signChannelConfig(config), ...extraSignatures || []];
    const txId = this.newTransactionID();

    const request = {
      name,
      config,
      signatures,
      orderer,
      txId
    };

    return await super.createChannel(request);
  }
}

module.exports = Client;