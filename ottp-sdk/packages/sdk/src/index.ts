import { AttestationDocument,  } from "./interface";
import { createAttestation, getAttestations, getAttestationsByFid, getCollabs, getEthAddresses, getOid } from "./utils";

export class OttpClient {
       
    getOttpAttestations = async (fid: string): Promise<AttestationDocument[] | null> => {
        let attestations: AttestationDocument[] = [] 
        const addrs = await getEthAddresses(fid)
        
        if (!addrs) return null
        
        for (const addr of addrs!) {
            const attestData = await getAttestations(addr)
            if (attestData && attestData.length > 0) {
                attestations = attestations.concat(attestData)
            }
        }
        //console.log(attestations)
        return attestations
    }

    createOttpAttestation = async (account: any, fromFid: number, data: string): Promise<`0x${string}`> => {
        const tx = await createAttestation(account, fromFid, data)
        return tx
    }

    getCollaborators = async (fid: string): Promise<string[]|null> => {
        const attestations = await getAttestationsByFid(fid)
        const collaborators = await getCollabs(fid, attestations)
        return collaborators

    }

    getOttpId = async (fid: number): Promise<number|null> => {
        const oid = await getOid(fid)!
        return oid
    }
}

