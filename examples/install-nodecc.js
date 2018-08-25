const network = require('./network');

(async () => {
  const client = await network.clientForPeerAdmin();

  const chaincodePath = __dirname + '/chaincode/node/fcw_example';

  const resp = await client.installChaincode({
    targets: network.getPeers(client),
    chaincodePath,
    chaincodeType: 'node',
    chaincodeId: 'fcw_node',
    chaincodeVersion: 'v0'
  });

  console.log(resp);
})().catch(console.log);