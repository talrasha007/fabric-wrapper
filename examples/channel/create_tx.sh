#!/bin/bash

export FABRIC_CFG_PATH=.

echo "##########################################################"
echo "#########  Generating Orderer Genesis block ##############"
echo "##########################################################"
configtxgen -profile SampleSingleMSPSolo -outputBlock orderer.genesis.block

echo
echo "#################################################################"
echo "### Generating channel configuration transaction 'channel.tx' ###"
echo "#################################################################"
configtxgen -profile SampleSingleMSPChannel -outputCreateChannelTx channel_ttl.tx -channelID ttl
