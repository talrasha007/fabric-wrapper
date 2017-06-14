const rewire = require('rewire');

const jsrsa = require('jsrsasign');
const { KEYUTIL } = jsrsa;

const EcdsaKey = rewire('fabric-client/lib/impl/ecdsa/key');
EcdsaKey.__set__('KEYUTIL', KEYUTIL); // Fix KEYUTIL issue.

class Crypto {
  constructor(key) {
    const kp = KEYUTIL.generateKeypair('RSA', 256);
    this._key = KEYUTIL.getKey(key);
  }

  privateEncrypt(content) {
    return this._key.sign(content);
  }

  getPEM() {
    const key = new EcdsaKey(this._key);
    return key.toBytes();
    // if (this._key.isPrivate) {
    //   return KEYUTIL.getPEM(this._key, 'PKCS8PRV');
    // } else {
    //   return KEYUTIL.getPEM(this._key);
    // }
  }
}

module.exports = Crypto;

const key =
`-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgCxbAW6cTOrPVGHqe
8PgyI+QoK2ajHOHeNOq4bkxJt4uhRANCAAQcG4qwA7jeGzgkakV+IYyQH/GwgtOw
6+Y3ZabCmw8dk0vrDwdZ7fEI9C10b9ckm9n4LvnooSxQEzfLDk9N+S7y
-----END PRIVATE KEY-----`;

const cert =
  `-----BEGIN CERTIFICATE-----
MIICjDCCAjKgAwIBAgIUBEVwsSx0TmqdbzNwleNBBzoIT0wwCgYIKoZIzj0EAwIw
fzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK
BgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMTYxMTExMTcwNzAw
WhcNMTcxMTExMTcwNzAwWjBjMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGgg
Q2Fyb2xpbmExEDAOBgNVBAcTB1JhbGVpZ2gxGzAZBgNVBAoTEkh5cGVybGVkZ2Vy
IEZhYnJpYzEMMAoGA1UECxMDQ09QMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE
HBuKsAO43hs4JGpFfiGMkB/xsILTsOvmN2WmwpsPHZNL6w8HWe3xCPQtdG/XJJvZ
+C756KEsUBM3yw5PTfku8qOBpzCBpDAOBgNVHQ8BAf8EBAMCBaAwHQYDVR0lBBYw
FAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFOFC
dcUZ4es3ltiCgAVDoyLfVpPIMB8GA1UdIwQYMBaAFBdnQj2qnoI/xMUdn1vDmdG1
nEgQMCUGA1UdEQQeMByCCm15aG9zdC5jb22CDnd3dy5teWhvc3QuY29tMAoGCCqG
SM49BAMCA0gAMEUCIDf9Hbl4xn3z4EwNKmilM9lX2Fq4jWpAaRVB97OmVEeyAiEA
25aDPQHGGq2AvhKT0wvt08cX1GTGCIbfmuLpMwKQj38=
-----END CERTIFICATE-----`;

const crypto = new Crypto(cert);
console.log(KEYUTIL.getPEM(crypto.getPEM()));