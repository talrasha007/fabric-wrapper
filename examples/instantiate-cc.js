const network = require('./network');
const abi = require('./abi.json');

(async () => {
  const client = await network.clientForPeerAdmin();
  const channel = network.getChannel(client);
  const chaincode = channel.chaincode(abi);

  await channel.initialize();

  console.log('Instantiate fcw_go', await chaincode.fcw_go.$instantiate('v0', '100'));
  console.log('Read from ledger fcw_go for key "ab":', await chaincode.fcw_go.read('abc'));

  console.log('Instantiate fcw_node', await chaincode.fcw_node.$instantiate('v0', '100'));
  console.log('Read from ledger fcw_node for key "ab":', await chaincode.fcw_node.read('abc'));
})().catch(console.log);