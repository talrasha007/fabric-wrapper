const network = require('./network');

(async () => {
  const client = await network.clientForPeer();
  const channel = network.getChannel(client);

  const ccResp = await Promise.all([
    channel.invokeChaincode({
      chaincodeId: 'fcw_go',
      fcn: 'write',
      args: ['ab', '123']
    }),
    channel.invokeChaincode({
      chaincodeId: 'fcw_go',
      fcn: 'write',
      args: ['bc', JSON.stringify({ ok: true })]
    })
  ]);

  console.log(ccResp);

  console.log('Read from ledger for key "ab": ');
  console.log(await channel.queryStringChaincode({
    chaincodeId: 'fcw_go',
    fcn: 'read',
    args: ['ab']
  }));

  console.log('Read from ledger for key "bc": ');
  console.log(await channel.queryJsonChaincode({
    chaincodeId: 'fcw_go',
    fcn: 'read',
    args: ['bc']
  }));

})().catch(console.log);