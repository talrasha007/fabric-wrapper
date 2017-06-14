const fs = require('fs');

function buildConnectionOpt(o) {
  if (typeof o === 'string') {
    return [{ url: o }];
  } else if (o.url) {
    const pem = o.pem || (o.pemPath && fs.readFileSync(o.pemPath, 'utf8'));
    return [{
      url: o.url,
      opt: { pem, 'ssl-target-name-override': o.sslTargetNameOverride }
    }];
  } else if (Array.isArray(o)) {
    return o.map(item => buildConnectionOpt(item)[0])
  }
}

module.exports = {
  getOrdererOpt: function (options) {
    return buildConnectionOpt(
      options.ordererUrl ||
      options.ordererUrls ||
      options.orderer ||
      options.orderers
    );
  },

  getPeerOpt: function (options) {
    return buildConnectionOpt(
      options.peerUrl ||
      options.peerUrls ||
      options.peer ||
      options.peers
    );
  }
};
