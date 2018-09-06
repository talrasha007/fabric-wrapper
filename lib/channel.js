const FabricChannel = require('fabric-client/lib/Channel');
const chaincode = require('./chaincode');

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

  chaincode(abi) {
    return chaincode(this._clientContext, this, abi);
  }

  addPeer(peer) {
    super.addPeer(peer);
    if (!this._eventHub) {
      this._eventHub = this.newChannelEventHub(peer);
    }
  }

  async initialize() {
    await super.initialize();
    this._eventHub.connect();
  }

  async queryStringChaincode(request) {
    const ret = await this.queryByChaincode(request);
    return ret && ret[0].toString();
  }

  async queryJsonChaincode(request) {
    const ret = await this.queryStringChaincode(request);
    return ret && JSON.parse(ret);
  }

  async invokeChaincode(request, timeout, validate = defaultValidate) {
    const txId = this.newTransactionID();
    const resp = await this.sendTransactionProposal(
      { txId, ...request },
      timeout
    );

    if (!validate(resp)) throw resp[0][0];

    return await this.commitTransaction(resp, txId, timeout);
  }

  async instantiateChaincode(request, timeout, validate = defaultValidate) {
    const txId = this.newTransactionID();
    const resp = await this.sendInstantiateProposal(
      { txId, ...request },
      timeout
    );

    if (!validate(resp)) throw resp[0][0];

    return await this.commitTransaction(resp, txId, timeout);
  }

  async upgradeChaincode(request, timeout, validate = defaultValidate) {
    const txId = this.newTransactionID();
    const resp = await this.sendUpgradeProposal(
      { txId, ...request },
      timeout
    );

    if (!validate(resp)) throw resp[0][0];

    return await this.commitTransaction(resp, txId, timeout);
  }

  async commitTransaction(proposalRes, txId, timeout) {
    const tx = convertProposalRes(proposalRes);

    const res = await Promise.all([
      this.sendTransaction(tx),
      await new Promise((resolve, reject) => {
        let timer;
        if (timeout) timer = setTimeout(() => reject(new Error('commitTransaction timeout')), timeout);

        if (!this._eventHub.isconnected())
          this._eventHub.connect();

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