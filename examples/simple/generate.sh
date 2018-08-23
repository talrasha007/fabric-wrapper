#!/bin/sh

id=$(docker create hyperledger/fabric-tools:1.2.0)
docker cp $id:/etc/hyperledger/fabric/msp ./
docker rm -v $id

alias configtxgen='docker run --rm\
  -v $(pwd):/out\
  hyperledger/fabric-tools:1.2.0 configtxgen'

configtxgen -outputBlock /out/genesis_block.pb -profile SampleSingleMSPSolo -channelID orderer-system-channel
configtxgen -outputCreateChannelTx /out/my_channel_tx.pb -profile SampleSingleMSPChannel -channelID my-channel
