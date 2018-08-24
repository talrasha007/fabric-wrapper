const shim = require('fabric-shim');

class Chaincode {

  async Init(stub) {
    const { params } = stub.getFunctionAndParameters();
    if (params.length !== 1) {
      return shim.error('Incorrect number of arguments.');
    }

    stub.putState('abc', Buffer.from('v2_' + params[0]));
    return shim.success();
  }

  async Invoke(stub) {
    const ret = stub.getFunctionAndParameters();
    console.error(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }

    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async write(stub, args) {
    if (args.length !== 2) {
      throw new Error('Incorrect number of arguments.');
    }

    await stub.putState(args[0], Buffer.from('v2_' + args[1]));
  }

  async read(stub, args) {
    if (args.length !== 1) {
      throw new Error('Incorrect number of arguments.');
    }

    return await stub.getState(args[0]);
  }
}

shim.start(new Chaincode());
