# OTTP Integration Kit

This is an official integration repo for OTTP.

## Using this example

Run the following command:

```sh
npm -i @ottp/sdk
```

## Usage

#### Get Attestations

This method fetches attestations made using OTTP protocol for a given FID (Farcaster ID).

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    const attestations = await ottp.getOttpAttestations('313600')
}

main()
```

#### Get OTTP ID

This method fetches the ottp id from the chain for a given FID (Farcaster ID).

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    ottp.getOttpId(313600)
}

main()
```
#### Create Attestation

Refer the example repo.
