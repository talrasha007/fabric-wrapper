const getChain = require('./getChain');
const fs = require('fs');

(async function () {
  const chain = await getChain();

  const tx = fs.readFileSync(__dirname + '/channel/channel_ttl.tx');
  console.log('Create channel: ', await chain.createChannel('ttl', tx));

  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Join channel: ', await chain.joinChannel());
})();