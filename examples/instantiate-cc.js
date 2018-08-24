const network = require('./network');

(async () => {
  const client = await network.clientForPeerAdmin();
  const channel = network.getChannel(client);

  await channel.initialize();

  const ccResp = await channel.instantiateChaincode({
    chaincodeId: 'fcw_go',
    chaincodeVersion: 'v0',
    fcn: 'init',
    args: ['100']
  });

  console.log(ccResp);

  console.log('Read from ledger for key "ab": ');
  console.log((await channel.queryByChaincode({
    chaincodeId: 'fcw_go',
    chaincodeVersion: 'v0',
    fcn: 'read',
    args: ['abc']
  })).map(b => b.toString()));
})().catch(console.log);