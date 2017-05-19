const rewire = require('rewire');
const Block = rewire('fabric-client/lib/Block');

const path = require('path');
const grpc = require('grpc');

const protoBase = path.join(require.resolve('fabric-client').replace(/(.+fabric-client)([\/\\].+)$/, '$1'), '/lib/protos');
const Proposal = grpc.load(path.join(protoBase, '/peer/proposal.proto')).protos;
const Chaincode = grpc.load(path.join(protoBase, '/peer/chaincode.proto')).protos;
const Common = grpc.load(path.join(protoBase, '/common/common.proto')).common;

function decodeCcPayload(envelope) {
  try {
    if (Buffer.isBuffer(envelope)) envelope = decodeEnvelop(envelope);

    const payloadBuf = envelope.payload.data.actions[0].payload.chaincode_proposal_payload.toBuffer();
    const payload = Proposal.ChaincodeProposalPayload.decode(payloadBuf);
    const data = Chaincode.ChaincodeInvocationSpec.decode(payload.input.toBuffer());
    return {
      signature: envelope.signature,
      payload: {
        header: envelope.payload.header,
        data
      }
    }
  } catch (_) {
    console.log(_)
  }
}

const decodeBlockDataEnvelope = Block.__get__('decodeBlockDataEnvelope');
function decodeEnvelop(envBuffer) {
  const proto_envelope = Common.Envelope.decode(envBuffer);
  return decodeBlockDataEnvelope(proto_envelope);
}

module.exports = {
  decodeCcPayload
};