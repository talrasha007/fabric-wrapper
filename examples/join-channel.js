const network = require('./network');

(async () => {
  const client = await network.getOrdererClient();

  const ordererOpt = network.ordererOptions;
  const orderer = client.newOrderer(ordererOpt.url, ordererOpt.opts);

  const channel = client.newChannel('my-channel');
  channel.addOrderer(orderer);
  network.peersOptions.forEach(po => {
    const peer = client.newPeer(po.url, po.opts);
    channel.addPeer(peer);
  });

  const resp = await channel.joinChannel();
  console.log(resp);
})().catch(console.log);