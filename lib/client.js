const FabricClient = require('fabric-client');

class Client extends FabricClient {
  constructor() {
    super();
  }

  async createChannel(orderer, name, envelope) {
    const config = this.extractChannelConfig(envelope);
    const signatures = [this.signChannelConfig(config)];
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