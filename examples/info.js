const getChain = require('./getChain');

(async function () {
  const chain = await getChain();

  await chain.initialize();
  console.log('MSP members: ', await chain.queryMspMembers());
  console.log('Ledger info: ', await chain.queryInfo());
  console.log('Block 0 info: ', await chain.queryBlock(0));
  console.log('Peer[0] info:', await chain.queryChannels(0));
})();