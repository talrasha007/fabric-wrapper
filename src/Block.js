const path = require('path');
const grpc = require('grpc');

const protoBase = path.join(require.resolve('fabric-client').replace(/(.+fabric-client)([\/\\].+)$/, '$1'), '/lib/protos');
const Chaincode = grpc.load(path.join(protoBase, '/peer/chaincode.proto')).protos;

function decodeCcPayload(envelope) {
  try {
    const payload = envelope.payload.data.actions[0].payload.chaincode_proposal_payload;
    const data = Chaincode.ChaincodeInvocationSpec.decode(new Buffer(payload.input));
    return {
      signature: envelope.signature.toString('hex'),
      payload: {
        header: envelope.payload.header,
        data
      }
    }
  } catch (_) {
    // console.log(_);
    return envelope;
  }
}

module.exports = {
  decodeCcPayload
};