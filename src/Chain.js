const fs = require('fs');
const path = require('path');
const utils = require('fabric-client/lib/utils');
const EventHub = require('fabric-client/lib/EventHub.js');

function convertProposalRes(res) {
  const [proposalResponses, proposal, header] = res;
  return { proposalResponses, proposal, header };
}

class Chain {
  constructor(enrollObj, options) {
    let eventhub;
    if (options.eventUrl) {
      eventhub = new EventHub();
      eventhub.setPeerAddr(options.eventUrl);
      eventhub.connect();
    }

    Object.assign(this, {
      get chain() { return enrollObj.chain; },
      get submitter() { return enrollObj.submitter; },
      get eventhub() { return eventhub }
      // get options() { return options; }
    });
  }

  buildTransactionID() {
    const nonce = utils.getNonce();
    const txId = this.chain.buildTransactionID(nonce, this.submitter);
    return { nonce, txId };
  }

  async commitTransaction(proposalRes, txId) {
    const tx = convertProposalRes(proposalRes);
    const txRes = await this.chain.sendTransaction(tx);

    if (this.eventhub) {
      const waitPromise = new Promise((resolve, reject) => {
        this.eventhub.registerTxEvent(txId.toString(), (tx, code) => {
          if (code === 'VALID') resolve();
          else reject(code);
        });
      });

      await waitPromise;
    }

    return txRes;
  }

  async queryMspMembers() {
    return this.chain.getOrganizationUnits();
  }

  async queryChannels(peerIdx = 0) {
    return await this.chain.queryChannels(this.chain.getPeers()[peerIdx]);
  }

  async queryInstalledChaincodes(peerIdx = 0) {
    return await this.chain.queryInstalledChaincodes(this.chain.getPeers()[peerIdx]);
  }

  async queryInstantiatedChaincodes() {
    return await this.chain.queryInstantiatedChaincodes();
  }

  async queryByChaincode(opt) {
    const { nonce, txId } = this.buildTransactionID();

    const request = {
      chainId: opt.chain || opt.channel || this.chain.getName(),
      chaincodeId: opt.name || opt.id || opt.chaincodeId || parsedPath.name,
      chaincodeVersion: opt.version,
      fcn: opt.fcn,
      args: opt.args,
      txId,
      nonce
    };

    return await this.chain.queryByChaincode(request);
  }

  async invokeChaincode(opt) {
    const { nonce, txId } = this.buildTransactionID();

    const request = {
      chainId: opt.chain || opt.channel || this.chain.getName(),
      chaincodeId: opt.name || opt.id || opt.chaincodeId || parsedPath.name,
      chaincodeVersion: opt.version,
      fcn: opt.fcn,
      args: opt.args,
      txId,
      nonce
    };

    const res = await this.chain.sendTransactionProposal(request);
    return await this.commitTransaction(res, txId);
  }

  async installChaincode(opt) {
    const parsedPath = path.parse(opt.path);
    const { nonce, txId } = this.buildTransactionID();
    process.env.GOPATH = path.resolve(parsedPath.dir, '..');

    const request = {
      chaincodePath: parsedPath.base,
      chaincodeId: opt.name || opt.id || opt.chaincodeId || parsedPath.name,
      chaincodeVersion: opt.version,
      txId,
      nonce
    };

    return convertProposalRes(await this.chain.sendInstallProposal(request));
  }

  async instantiateChaincode(opt) {
    const parsedPath = path.parse(opt.path);
    const { nonce, txId } = this.buildTransactionID();
    process.env.GOPATH = path.resolve(parsedPath.dir, '..');

    const request = {
      chainId: opt.chain || opt.channel || this.chain.getName(),
      chaincodePath: parsedPath.base,
      chaincodeId: opt.name || opt.id || opt.chaincodeId || parsedPath.name,
      chaincodeVersion: opt.version,
      fcn: 'init',
      args: opt.args,
      txId: txId,
      nonce: nonce,
    };

    await this.chain.initialize();
    const res = await this.chain.sendInstantiateProposal(request);
    return await this.commitTransaction(res, txId);
  }

  async createChannel(opt) {
    const data = fs.readFileSync(opt.path);
    const request = {
      envelope : data,
      name : opt.name || opt.chain || opt.channel || this.chain.getName(),
      orderer : this.chain.getOrderers()[0]
    };

    // send to orderer
    return this.chain.createChannel(request);
  }

  async joinChannel() {
    const { nonce, txId } = this.buildTransactionID();
    const request = {
      targets : this.chain.getPeers(),
      txId : 	txId,
      nonce : nonce
    };

    return await this.chain.joinChannel(request);
  }

  async queryInfo() {
    const info = await this.chain.queryInfo();
    const currentBlockHash = info.currentBlockHash.toHex();
    const previousBlockHash = info.previousBlockHash.toHex();
    const height = info.height.toInt();
    return { height, currentBlockHash, previousBlockHash };
  }

  async queryBlock(blockId) {
    const block = await this.chain.queryBlock(blockId);
    const header = block.header;

    return {
      number: header.number,
      previousHash: header.previous_hash.toHex(),
      dataHash: header.data_hash.toHex(),
      data: block.data.toBuffer(),
      metadata: block.metadata.metadata.map(meta => meta.toBuffer())
    };
  }
}

module.exports = Chain;