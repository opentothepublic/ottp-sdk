# OTTP Integration Kit

This is an official integration repo for OTTP.

## Using this example

Run the following command:

```sh
npm -i @ottp/sdk
```

## Usage

#### Get Attestations

This method fetches attesations made using OTTP protocol for a given FID (Farcastar ID).

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    const attestations = await ottp.getOttpAttestations('313600')
}

main()
```

#### Get OTTP ID

This method fetches the ottp id from the chain for a given FID (Farcastar ID).

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    ottp.getOttpId(313600)
}

main()
```

#### Get Collaborators

This method fetches the collaborators for a given FID (Farcastar ID).

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    const collabs = await ottp.getCollaborators('316300')
    console.log(collabs)
}

main()
```

#### Create Attestation

Refer the [example](https://github.com/opentothepublic/ottp-sdk/tree/main/example) repo.
