const getChain = require('./getChain');

(async function () {
  const chain = await getChain();

  // console.log('Query installed cc for peer0: ', await chain.queryInstalledChaincodes(0));
  console.log('Query instantiated cc: ', await chain.queryInstantiatedChaincodes());

  chain.eventhub.registerBlockEvent(block => {
    console.log('Cc executed: \n', chain.extractCcExecInfo(block));
    console.log(block.header);
  });

  console.log('Write to ledger for key "ab": ');
  console.log(await chain.invokeChaincode({
    name: 'fcw_example',
    fcn: 'write',
    args: ['ab', '300']
  }));

  console.log('Read from ledger for key "ab": ');
  console.log((await chain.queryByChaincode({
    name: 'fcw_example',
    fcn: 'read',
    args: ['ab']
  })).map(b => b.toString()));
})();