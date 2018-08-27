const fs = require('fs');
const path = require('path');

function loadFile(dir) {
  const files = fs.readdirSync(dir).map(f => `${dir}/${f}`);
  return fs.readFileSync(files[0]);
}

module.exports = {
  mspFromCryptoGen(cryptoPath, domain, user) {
    const basePath = path.join(cryptoPath, 'peerOrganizations', domain, 'users', `${user}@${domain}/msp`);
    const keyPath = basePath + '/keystore';
    const certPath = basePath + '/signcerts';

    const privateKey = loadFile(keyPath);
    const signedCert = loadFile(certPath);

    return { privateKey, signedCert };
  }
};