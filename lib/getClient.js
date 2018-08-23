const FabricClient = require('fabric-client');
const FabricCaClient = require('fabric-ca-client');

const keyStorePath = `${require('os').homedir()}/.hfc-key-store`;

async function enroll(opt, cryptoSuite) {
  const tlsOptions = opt.ca.tlsOptions || {
    trustedRoots: [],
    verify: false
  };

  // be sure to change the http to https when the CA is running TLS enabled
  const caClient = new FabricCaClient(opt.ca.url, tlsOptions , opt.ca.name, cryptoSuite);

  const enrollment = await caClient.enroll({
    enrollmentID: opt.user,
    enrollmentSecret: opt.password
  });

  return {
    username: opt.user,
    mspid: opt.mspId,
    cryptoContent: {
      privateKeyPEM: enrollment.key.toBytes(),
      signedCertPEM: enrollment.certificate
    }
  };
}

async function load(opt) {
  return {
    username: opt.user,
    mspid: opt.mspId,
    cryptoContent: {
      privateKeyPEM: opt.privateKey,
      signedCertPEM: opt.signedCert
    }
  };
}

module.exports = async function(opt) {
  const storeOpt = {
    path: (opt.keyStorePath || keyStorePath)+ '/' + opt.uuid
  };

  const stateStore = await FabricClient.newDefaultKeyValueStore(storeOpt);

  const client = new FabricClient();
  client.setStateStore(stateStore);

  const cryptoSuite = FabricClient.newCryptoSuite();
  const cryptoStore = FabricClient.newCryptoKeyStore(storeOpt);
  cryptoSuite.setCryptoKeyStore(cryptoStore);
  client.setCryptoSuite(cryptoSuite);

  // first check to see if the admin is already enrolled
  const userFromStore = client.getUserContext(opt.user, true);

  if (!userFromStore || !userFromStore.isEnrolled()) {
    const userDesc = opt.ca ? enroll(opt, cryptoStore) : load(opt);
    const user = await client.createUser(userDesc);
    client.setUserContext(user);
  }

  return client;
};