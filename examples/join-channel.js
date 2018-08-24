const network = require('./network');

(async () => {
  const client = await network.clientForPeerAdmin();
  const channel = network.getChannel(client);

  const resp = await channel.joinChannel();
  console.log(resp);
})().catch(console.log);