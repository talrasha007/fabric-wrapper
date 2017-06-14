const rewire = require('rewire');
const path = require('path');
const FabricClient = require('fabric-client');
const Orderer = require('fabric-client/lib/Orderer.js');
const Peer = require('fabric-client/lib/Peer.js');
const User = require('fabric-client/lib/User.js');
const CaService = require('fabric-ca-client/lib/FabricCAClientImpl.js');
const jsrsa = require('jsrsasign');
const KEYUTIL = jsrsa.KEYUTIL;

const EcdsaKey = rewire('fabric-client/lib/impl/ecdsa/key');
EcdsaKey.__set__('KEYUTIL', KEYUTIL); // Fix KEYUTIL issue.

const CryptoSuite = require('fabric-client/lib/impl/CryptoSuite_ECDSA_AES');
const KeyStore = require('fabric-client/lib/impl/CryptoKeyStore');

const util = require('./util');
const Chain = require('./Chain');
const keyStorePath = CryptoSuite.getDefaultKeyStorePath();

async function getSubmitter(client, options) {
  const { enrollmentID } = options.enrollment;
  const user = await client.getUserContext(enrollmentID);

  if (user && user.isEnrolled()) {
    return user;
  } else {
    let enrollment;

    if (options.caUrl && options.enrollment.enrollmentSecret) {
      const { enrollmentID, enrollmentSecret, ou } = options.enrollment;

      const caService = new CaService(options.caUrl);
      const caClient = caService._fabricCAClient;

      const key = await caService.cryptoPrimitives.generateKey();
      const csr = key.generateCSR(`CN=${enrollmentID},OU=${ou}`);
      const enrollResponse = await caClient.enroll(enrollmentID, enrollmentSecret, csr);
      enrollment = {
        key,
        certificate: enrollResponse.enrollmentCert,
        rootCertificate: enrollResponse.caCertChain
      }
    } else {
      enrollment = options.enrollment;
      enrollment.key = new EcdsaKey(KEYUTIL.getKey(enrollment.key));

      const keyStore = await new KeyStore({ path: keyStorePath });
      await keyStore.putKey(enrollment.key);
    }

    const member = new User(enrollmentID, client);
    await member.setEnrollment(enrollment.key, enrollment.cert || enrollment.certificate, options.mspId);
    client.setUserContext(member);

    const pubKey = enrollment.key._key.pubKeyHex;
    return { submitter: member, pubKey };
  }
}

module.exports = async function (options) {
  if (!options.uuid) {
    throw new Error('Cannot enroll with undefined uuid');
  }

  const client = new FabricClient();
  const chain = client.newChain(options.channelId);

  const store = await FabricClient.newDefaultKeyValueStore({
    path: path.join(keyStorePath, options.uuid) //store eCert in the kvs directory
  });

  client.setStateStore(store);
  const { submitter, pubKey } = await getSubmitter(client, options);

  for (const ordererOpt of util.getOrdererOpt(options)) {
    const { url, opt } = ordererOpt;
    chain.addOrderer(new Orderer(url, opt));
  }

  for (const peerOpt of util.getPeerOpt(options)) {
    const { url, opt } = peerOpt;
    chain.addPeer(new Peer(url, opt));
  }

  return new Chain({ client, chain, submitter, pubKey }, options);
};