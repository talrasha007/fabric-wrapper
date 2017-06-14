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
MIICYjCCAgmgAwIBAgIUB3CTDOU47sUC5K4kn/Caqnh114YwCgYIKoZIzj0EAwIw
fzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK
BgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMTYxMDEyMTkzMTAw
WhcNMjExMDExMTkzMTAwWjB/MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZv
cm5pYTEWMBQGA1UEBxMNU2FuIEZyYW5jaXNjbzEfMB0GA1UEChMWSW50ZXJuZXQg
V2lkZ2V0cywgSW5jLjEMMAoGA1UECxMDV1dXMRQwEgYDVQQDEwtleGFtcGxlLmNv
bTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABKIH5b2JaSmqiQXHyqC+cmknICcF
i5AddVjsQizDV6uZ4v6s+PWiJyzfA/rTtMvYAPq/yeEHpBUB1j053mxnpMujYzBh
MA4GA1UdDwEB/wQEAwIBBjAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQXZ0I9
qp6CP8TFHZ9bw5nRtZxIEDAfBgNVHSMEGDAWgBQXZ0I9qp6CP8TFHZ9bw5nRtZxI
EDAKBggqhkjOPQQDAgNHADBEAiAHp5Rbp9Em1G/UmKn8WsCbqDfWecVbZPQj3RK4
oG5kQQIgQAe4OOKYhJdh3f7URaKfGTf492/nmRmtK+ySKjpHSrU=
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