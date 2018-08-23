const simple = require('./simple');

(async () => {
  const client = await simple.fromCa();
})().catch(console.log);