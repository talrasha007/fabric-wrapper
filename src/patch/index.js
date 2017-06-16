const fs = require('fs');

const toPatch = require.resolve('fabric-client/lib/BlockDecoder');
const patch = require.resolve('./BlockDecoder');

fs.writeFileSync(
  toPatch,
  fs.readFileSync(patch)
);