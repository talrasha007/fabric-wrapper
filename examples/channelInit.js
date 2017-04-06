const getChain = require('./getChain');

(async function () {
  const chain = await getChain();

  console.log('Create channel: ', await chain.createChannel({
    path: 'channel_ttl.tx'
  }));

  console.log('Join channel: ', await chain.joinChannel());
})();