#!/bin/sh

alias cryptogen='docker run --rm -v $(pwd):/out hyperledger/fabric-tools:1.2.0 cryptogen'

cryptogen generate --config=/out/crypto.yaml --output=/out/crypto-config
