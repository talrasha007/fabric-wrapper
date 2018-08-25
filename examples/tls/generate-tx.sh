#!/bin/sh

alias configtxgen='docker run --rm\
  -e FABRIC_CFG_PATH=/out\
  -v $(pwd):/out\
  hyperledger/fabric-tools:1.2.0 configtxgen'

configtxgen -outputBlock /out/genesis_block.pb -profile MSPSolo -channelID orderer-system-channel
configtxgen -outputCreateChannelTx /out/my_channel_tx.pb -profile MSPChannel -channelID my-channel
