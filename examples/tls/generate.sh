#!/bin/sh

alias cryptogen='docker run --rm\
  -e FABRIC_CFG_PATH=/out\
  -v $(pwd):/out\
  hyperledger/fabric-tools:1.2.0 cryptogen'

alias configtxgen='docker run --rm\
  -e FABRIC_CFG_PATH=/out\
  -v $(pwd)/crypto-config/peerOrganizations:/out/peerOrganizations\
  -v $(pwd)/crypto-config/ordererOrganizations:/out/ordererOrganizations\
  -v $(pwd):/out\
  hyperledger/fabric-tools:1.2.0 configtxgen'

cryptogen generate --output=/out/crypto-config
configtxgen -outputBlock /out/genesis_block.pb -profile SampleSingleMSPSolo -channelID orderer-system-channel
configtxgen -outputCreateChannelTx /out/my_channel_tx.pb -profile SampleTwoOrgMSPChannel -channelID my-channel
