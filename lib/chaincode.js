
function convertArgs(args) {
  return args.map(a => Buffer.isBuffer(a) || a.toBuffer || 'string' === typeof a ? a : JSON.stringify(a));
}

module.exports = function (client, channel, abi) {
  const ret = {};

  const channelFunctions = {
    'query_buffer': channel.queryByChaincode,
    'query_string': channel.queryStringChaincode,
    'query_object': channel.queryJsonChaincode,
    'query_json': channel.queryJsonChaincode,
    'invoke': channel.invokeChaincode
  };

  const chaincodeIds = Object.keys(abi);
  for (const chaincodeId of chaincodeIds) {
    const cc = ret[chaincodeId] = {};

    cc.$install = request => client.installChaincode({
      chaincodeId,
      ...request
    });

    cc.$instantiate = (chaincodeVersion, ...args) => channel.instantiateChaincode({
      chaincodeId,
      chaincodeVersion,
      args: convertArgs(args)
    });

    cc.$upgrade = (chaincodeVersion, ...args) => channel.upgradeChaincode({
      chaincodeId,
      chaincodeVersion,
      args: convertArgs(args)
    });

    const ccDesc = abi[chaincodeId];
    const fcnNames = Object.keys(ccDesc);
    for (const fcn of fcnNames) {
      const fcnDesc = ccDesc[fcn];
      const fnKey = fcnDesc.type === 'invoke' ?
        'invoke':
        `${fcnDesc.type}_${fcnDesc.returnType}`;
      const fnToCall = channelFunctions[fnKey];
      if (fnToCall) {
        cc[fcn] = (...args) =>
          fnToCall.call(channel, {
            chaincodeId,
            fcn,
            args: convertArgs(args)
          });
      } else {
        console.error('Warning: there is something wrong with cc desc', fcnDesc);
      }
    }
  }

  return ret;
};