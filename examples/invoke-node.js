const network = require('./network');

(async () => {
  const client = await network.clientForPeer();
  const channel = network.getChannel(client);

  const ccResp = await Promise.all([
    channel.invokeChaincode({
      chaincodeId: 'fcw_node',
      chaincodeVersion: 'v0',
      fcn: 'write',
      args: ['ab', '123']
    }),
    channel.invokeChaincode({
      chaincodeId: 'fcw_node',
      chaincodeVersion: 'v0',
      fcn: 'write',
      args: ['bc', '456']
    })
  ]);

  console.log(ccResp);

  console.log('Read from ledger for key "ab": ');
  console.log((await channel.queryByChaincode({
    chaincodeId: 'fcw_node',
    chaincodeVersion: 'v0',
    fcn: 'read',
    args: ['ab']
  })).map(b => b.toString()));

  console.log('Read from ledger for key "bc": ');
  console.log((await channel.queryByChaincode({
    chaincodeId: 'fcw_node',
    chaincodeVersion: 'v0',
    fcn: 'read',
    args: ['bc']
  })).map(b => b.toString()));

})().catch(console.log);