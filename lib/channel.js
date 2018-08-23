const FabricChannel = require('fabric-client/lib/Channel');

class Channel extends FabricChannel {
  constructor(name, client) {
    super(name, client);
  }

  newTransactionID() {
    return this._clientContext.newTransactionID();
  }

  async joinChannel(targets = this.getPeers()) {
    const block = await this.getGenesisBlock({ txId: this.newTransactionID() });
    const txId = this.newTransactionID();

    return super.joinChannel({
      targets,
      block: block,
      txId
    });
  }
}

module.exports = Channel;