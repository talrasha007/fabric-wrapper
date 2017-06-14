const fabric = require('../');

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

const caCert =
`-----BEGIN CERTIFICATE-----
MIIB9TCCAZugAwIBAgIJAJPPGB4Yn+s2MAoGCCqGSM49BAMCMFcxCzAJBgNVBAYT
AkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBXaWRn
aXRzIFB0eSBMdGQxEDAOBgNVBAMMB2NhX3Rlc3QwHhcNMTcwNjE0MTAwMzI3WhcN
MTcwNzE0MTAwMzI3WjBXMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0
ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMRAwDgYDVQQDDAdj
YV90ZXN0MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEHBuKsAO43hs4JGpFfiGM
kB/xsILTsOvmN2WmwpsPHZNL6w8HWe3xCPQtdG/XJJvZ+C756KEsUBM3yw5PTfku
8qNQME4wHQYDVR0OBBYEFOFCdcUZ4es3ltiCgAVDoyLfVpPIMB8GA1UdIwQYMBaA
FOFCdcUZ4es3ltiCgAVDoyLfVpPIMAwGA1UdEwQFMAMBAf8wCgYIKoZIzj0EAwID
SAAwRQIhAKRtiNctX5Uvl/21oNXRAmoKge7Yu0cR+GmFmuH9q9AXAiAwQMLKUuM9
XSZrEBlM6tkjqGu21RVl1tyNe3xB3AQU3A==
-----END CERTIFICATE-----`;

// process.env.USE_TLS = true;
const protocol = process.env.USE_TLS ? 'grpcs' : 'grpc';

async function fromCert() {
  console.log('Enroll with cert.');

  return await fabric.getChain(
    {
      enrollment: {
        enrollmentID: 'test-client',
        key,
        cert
      },
      uuid:'test',
      channelId: 'ttl',
      orderer: {
        url: `${protocol}://localhost:7050`,
        pem: process.env.USE_TLS && caCert,
        sslTargetNameOverride: 'orderer'
      },
      peers: [
        {
          url: `${protocol}://localhost:7051`,
          pem: process.env.USE_TLS && caCert,
          sslTargetNameOverride: 'peer'
        }
      ],
      eventUrl: `${protocol}://localhost:7053`,
      mspId: 'DEFAULT'
    }
  );
}

async function fromCa() {
  console.log('Enroll with ca server.');

  return await fabric.getChain(
    {
      enrollment: {
        enrollmentID: 'admin',
        enrollmentSecret: 'adminpw',
        ou: 'COP'
      },
      uuid:'test',
      channelId: 'ttl',
      orderer: {
        url: `${protocol}://localhost:7050`,
        pem: process.env.USE_TLS && ca,
        sslTargetNameOverride: 'orderer'
      },
      peers: [
        {
          url: `${protocol}://localhost:7051`,
          pem: process.env.USE_TLS && ca,
          sslTargetNameOverride: 'peer'
        }
      ],
      eventUrl: `${protocol}://localhost:7053`,
      caUrl: 'http://localhost:7054',
      mspId: 'DEFAULT'
    }
  )
}

module.exports = /^true/i.test(process.env.USE_CA) ? fromCa : fromCert;