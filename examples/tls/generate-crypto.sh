#!/bin/sh

alias cryptogen='docker run --rm\
  -e FABRIC_CFG_PATH=/out\
  -v $(pwd):/out\
  hyperledger/fabric-tools:1.2.0 cryptogen'

cryptogen generate --output=/out/crypto-config
