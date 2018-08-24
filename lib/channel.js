const FabricChannel = require('fabric-client/lib/Channel');

function convertProposalRes(res) {
  const [proposalResponses, proposal] = res;
  return { proposalResponses, proposal };
}

function defaultValidate(res) {
  const proposalResponses = res[0];
  return proposalResponses &&
    proposalResponses.every(pr => pr.response && pr.response.status === 200);
}

class Channel extends FabricChannel {
  constructor(name, client) {
    super(name, client);
  }

  newTransactionID() {
    return this._clientContext.newTransactionID();
  }

  addPeer(peer) {
    super.addPeer(peer);
    if (!this._eventHub) {
      this._eventHub = this.newChannelEventHub(peer);
      this._eventHub.connect();
    }
  }

  async invokeChaincode(request, timeout, validate = defaultValidate) {
    const txId = this.newTransactionID();
    const resp = await this.sendTransactionProposal(
      { txId, ...request },
      timeout
    );

    if (!validate(resp)) throw new Error('invokeChaincode response error.');

    return await this.commitTransaction(resp, txId, timeout);
  }

  async instantiateChaincode(request, timeout, validate = defaultValidate) {
    const txId = this.newTransactionID();
    const resp = await this.sendInstantiateProposal(
      { txId, ...request },
      timeout
    );

    if (!validate(resp)) throw new Error('instantiateChaincode response error.');

    return await this.commitTransaction(resp, txId, timeout);
  }

  async upgradeChaincode(request, timeout, validate = defaultValidate) {
    const txId = this.newTransactionID();
    const resp = await this.sendUpgradeProposal(
      { txId, ...request },
      timeout
    );

    if (!validate(resp)) throw new Error('instantiateChaincode response error.');

    return await this.commitTransaction(resp, txId, timeout);
  }

  async commitTransaction(proposalRes, txId, timeout) {
    const tx = convertProposalRes(proposalRes);

    const res = await Promise.all([
      this.sendTransaction(tx),
      await new Promise((resolve, reject) => {
        let timer;
        if (timeout) timer = setTimeout(() => reject(new Error('commitTransaction timeout')), timeout);

        this._eventHub.registerTxEvent(txId.getTransactionID(), (tx, code) => {
          if (timer) clearTimeout(timer);
          this._eventHub.unregisterTxEvent(txId.getTransactionID());

          if (code === 'VALID') resolve();
          else reject(code);
        });
      })
    ]);

    return res[0];
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