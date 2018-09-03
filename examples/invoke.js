const network = require('./network');
const abi = require('./abi.json');

(async () => {
  const client = await network.clientForPeer();
  const channel = network.getChannel(client);
  const chaincode = channel.chaincode(abi);

  console.log('Invoke fcw_go: ', await Promise.all([
    chaincode.fcw_go.write('ab', '123'),
    chaincode.fcw_go.write('bc', JSON.stringify({ ok: true }))
  ]));

  console.log('fcw_go.read ab:', await chaincode.fcw_go.read('ab'));
  console.log('fcw_go.read bc:', await chaincode.fcw_go.read('bc'));

  console.log('Invoke fcw_node: ', await Promise.all([
    chaincode.fcw_node.write('ab', '123'),
    chaincode.fcw_node.write('bc', JSON.stringify({ ok: true }))
  ]));

  console.log('fcw_node.read ab:', await chaincode.fcw_node.read('ab'));
  console.log('fcw_node.read bc:', await chaincode.fcw_node.read('bc'));
})().catch(console.log);