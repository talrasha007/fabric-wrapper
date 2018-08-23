const network = require('./network');

(async () => {
  const client = await network.getOrdererClient();
  const orderer = network.getOrderer(client);

  const resp = await client.createChannel(orderer, 'my-channel', network.channelTx);
  console.log(resp);
})().catch(console.log);