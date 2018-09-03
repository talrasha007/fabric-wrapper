const network = require('./network');
const abi = require('./abi.json');

(async () => {
  const client = await network.clientForPeerAdmin();
  const channel = network.getChannel(client);
  const chaincode = channel.chaincode(abi);

  const chaincodePath = __dirname + '/chaincode/node/fcw_example_v2';
  await chaincode.fcw_node.$install({
    targets: network.getPeers(client),
    chaincodePath,
    chaincodeType: 'node',
    chaincodeVersion: 'v2.0'
  });

  await channel.initialize();

  console.log('Upgrade fcw_node', await chaincode.fcw_node.$upgrade('v2.0', '100'));
  console.log('fcw_node.read(abc):', await chaincode.fcw_node.read('abc'));
})().catch(console.log);