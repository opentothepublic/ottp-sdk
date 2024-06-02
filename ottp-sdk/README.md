# OTTP Integration Kit

This is an official integration repo for OTTP.

## Using this example

Run the following command to install:

```sh
npm i @ottp/sdk
```

## Usage

#### Get Attestations

This method fetches attesations made using OTTP protocol for a given FID (Farcaster ID). Set `userInfo` to `true` if you need user details of the attester and the attested to be returned.

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    const attestations = await getOttpAttestations('316300', true)
}

main()
```

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    const attestations = await gettOttpAttestations('316300')
}

main()
```


#### Get OTTP ID

This method fetches the ottp id from the chain for a given FID (Farcaster ID).

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    ottp.getOttpId(316300)
}

main()
```

#### Get Collaborators

This method fetches the collaborators for a given FID (Farcaster ID).

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    const collabs = await ottp.getCollaborators('316300')
    console.log(collabs)
}

main()
```

#### Get FIDs from tagged users

This method would be typically used in web clients to validate usernames entered by users while attesting.

```sh
import { OttpClient } from '@ottp/sdk'

const main = async () => {

    const ottp = new OttpClient()
    const fids = await ottp.getTaggedUserFids('@lowcodekrish @ting')
    console.log(fids)
}

main()
```

#### Create Attestation

Refer the [example](https://github.com/opentothepublic/ottp-sdk/tree/main/example) repo.
