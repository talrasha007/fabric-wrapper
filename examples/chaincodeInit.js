const getChain = require('./getChain');

(async function () {
  const chain = await getChain();

  console.log('Install cc: ', await chain.installChaincode({
    path: 'chaincode/src/fcw_example',
    version: 'v0'
  }));

  console.log('Instantiate cc: ', await chain.instantiateChaincode({
    chain: 'ttl',
    path: 'chaincode/src/fcw_example',
    version: 'v0',
    args: ['100']
  }));

  console.log('Read from ledger for key "abc": ');
  console.log((await chain.queryByChaincode({
    name: 'fcw_example',
    fcn: 'read',
    args: ['abc']
  })).map(b => b.toString()));
})();