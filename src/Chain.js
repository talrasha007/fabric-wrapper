const _ = require('co-lodash');
// const fs = require('fs');
const path = require('path');
const EventHub = require('fabric-client/lib/EventHub.js');
const X509 = require('jsrsasign').X509;

const util = require('./util');
const Block = require('./Block');

function convertProposalRes(res) {
  const [proposalResponses, proposal, header] = res;
  return { proposalResponses, proposal, header };
}

function getCertInfo(cert) {
  const x509 = new X509();
  x509.readCertPEM(cert);

  const serial = x509.getSerialNumberHex();
  const issuer = x509.getIssuerString();
  const subject = x509.getSubjectString();
  const pubKey = X509.getPublicKeyFromCertPEM(cert);
  const pubKeyHex = pubKey.pubKeyHex;

  return { serial, issuer, subject, pubKeyHex, pubKey };
}

class Chain {
  constructor(enrollObj, options) {
    let eventhub;
    const { eventUrl, opt } = util.getPeerOpt(options)[0];
    if (eventUrl) {
      eventhub = new EventHub(enrollObj.client);
      eventhub.setPeerAddr(eventUrl, _.defaults(opt, {
        'grpc.http2.keepalive_time': 60,
        'grpc.keepalive_time_ms': 60000,
        'grpc.http2.keepalive_timeout': 20,
        'grpc.keepalive_timeout_ms': 20000
      }));
      eventhub.connect();
    }

    Object.assign(this, {
      get pubKey() { return enrollObj.pubKey },
      get client() { return enrollObj.client },
      get chain() { return enrollObj.chain; },
      get submitter() { return enrollObj.submitter; },
      get eventhub() { return eventhub },
      get orderer() { return enrollObj.orderer }
      // get options() { return options; }
    });
  }

  initialize() {
    return this.chain.initialize();
  }

  decodeBlock(block) {
    const { header, data, metadata } = block;
    const payloads = data.data.map(item => Block.decodeCcPayload(item) || item);
    return { header, metadata, payloads };
  }

  extractCcExecInfo(block) {
    try {
      block = this.decodeBlock(block);

      block.payloads = block.payloads.map(payloadData => {
        try {
          const payload = payloadData.payload;
          const header = payload.header.channel_header;
          const ts = header.timestamp;
          const txId = header.tx_id;
          const creator = payload.header.signature_header.creator;
          Object.assign(creator, getCertInfo(creator.IdBytes));

          const cs = payload.data.chaincode_spec;

          const chaincodeId = cs.chaincode_id;
          const fn = cs.input.args[0].toBuffer().toString();
          const args = cs.input.args.slice(1).map(bb => bb.toBuffer());

          return { signature: payloadData.signature, chaincodeId, fn, args, ts, txId, creator };
        } catch (_) {
          return payloadData;
        }
      });
    } catch (_) {

    }

    return block;
  }

  buildTransactionID() {
    const txId = this.client.newTransactionID();
    return { nonce: txId.getNonce(), txId };
  }

  async commitTransaction(proposalRes, txId) {
    const tx = convertProposalRes(proposalRes);
    const txRes = await this.chain.sendTransaction(tx);

    if (this.eventhub) {
      const waitPromise = new Promise((resolve, reject) => {
        this.eventhub.registerTxEvent(txId.getTransactionID(), (tx, code) => {
          if (code === 'VALID') resolve();
          else reject(code);
        });
      });

      await waitPromise;
    }

    return txRes;
  }

  async queryMspMembers() {
    return this.chain.getOrganizations();
  }

  async queryChannels(peerIdx = 0) {
    return await this.client.queryChannels(this.chain.getPeers()[peerIdx]);
  }

  async queryInstalledChaincodes(peerIdx = 0) {
    return await this.client.queryInstalledChaincodes(this.chain.getPeers()[peerIdx]);
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
      targets: this.chain.getPeers(),
      chaincodePath: parsedPath.base,
      chaincodeId: opt.name || opt.id || opt.chaincodeId || parsedPath.name,
      chaincodeVersion: opt.version,
      // chaincodePackage: params.chaincodePackage,
      txId,
      nonce
    };

    return convertProposalRes(await this.client.installChaincode(request));
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
      txId,
      nonce
    };

    await this.chain.initialize();
    const res = await this.chain.sendInstantiateProposal(request);
    return await this.commitTransaction(res, txId);
  }

  async createChannel(channelId, envelope) {
    const config = this.client.extractChannelConfig(envelope);
    const signatures = [this.client.signChannelConfig(config)];

    const { nonce, txId } = this.buildTransactionID();
    const request = {
      name : channelId,
      config,
      signatures,
      orderer : this.chain.getOrderers()[0],
      txId,
      nonce
    };

    // send to orderer
    return this.client.createChannel(request);
  }

  // async updateChannel(channelDesc, msps) {
  //   const config = await this.chain.buildChannelConfig(
  //     channelDesc,
  //     msps.map(m => this.client.newMSP(m))
  //   );
  //
  //   const { nonce, txId } = this.buildTransactionID();
  //   const request = {
  //     name : channelDesc.channel.name,
  //     config,
  //     signatures: [
  //       this.client.signChannelConfig(config),
  //       this.client.signChannelConfig(config)
  //     ],
  //     orderer : this.chain.getOrderers()[0],
  //     txId,
  //     nonce
  //   };
  //
  //   // send to orderer
  //   return this.client.createChannel(request);
  // }

  async getGenesisBlock() {
    const { nonce, txId } = this.buildTransactionID();
    const request = {
      txId : 	txId,
      nonce : nonce
    };

    return await this.chain.getGenesisBlock(request);
  }

  async joinChannel() {
    const { nonce, txId } = this.buildTransactionID();
    const request = {
      targets : this.chain.getPeers(),
      block: await this.getGenesisBlock(),
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
    return await this.chain.queryBlock(blockId);
  }
}

module.exports = Chain;