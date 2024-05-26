import { AtnInfo, AttestData, AttestationDocument,  } from "./interface";
import { createAttestation, getAttestations, getAttestationsByFid, getCollabs, getEthAddresses, getFids, getOid } from "./utils";

export class OttpClient {
       
    getOttpAttestations = async (fid: string, userInfo?: boolean): Promise<AtnInfo|null> => {
        const documents = await getAttestationsByFid(fid)
        if (userInfo) {
            const attestations = await getAttestations(fid, documents, true)
            return attestations
        } else {
            const attestations = await getAttestations(fid, documents)
            return attestations
        }
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

    getTaggedUserFids = async (fnames: string): Promise<string[]> => {
        const userFids: string[] = await getFids(fnames)
        return userFids
    }
}    

