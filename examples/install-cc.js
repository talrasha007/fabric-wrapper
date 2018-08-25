const network = require('./network');

(async () => {
  const client = await network.clientForPeerAdmin();

  process.env['GOPATH'] = __dirname + '/chaincode/go/';
  const chaincodePath = 'fcw_example';

  const resp = await client.installChaincode({
    targets: network.getPeers(client),
    chaincodePath,
    chaincodeId: 'fcw_go',
    chaincodeVersion: 'v0'
  });

  console.log(resp);
})().catch(console.log);