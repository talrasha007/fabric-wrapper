const network = require('./network');

(async () => {
  const client = await network.clientForPeerAdmin();
  const channel = network.getChannel(client);

  const chaincodePath = __dirname + '/chaincode/node/fcw_example_v2';
  await client.installChaincode({
    targets: network.getPeers(client),
    chaincodePath,
    chaincodeType: 'node',
    chaincodeId: 'fcw_node',
    chaincodeVersion: 'v2.0'
  });

  await channel.initialize();

  const ccResp = await channel.upgradeChaincode({
    chaincodeId: 'fcw_node',
    chaincodeVersion: 'v2.0',
    args: ['100']
  });

  console.log(ccResp);

  console.log('Read from ledger for key "abc": ');
  console.log((await channel.queryByChaincode({
    chaincodeId: 'fcw_node',
    fcn: 'read',
    args: ['abc']
  })).map(b => b.toString()));
})().catch(console.log);