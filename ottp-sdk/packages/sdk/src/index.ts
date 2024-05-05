import { AttestationDocument, OttpClientConfiguration } from "./interface";
import { getAttestations, getEthAddresses, getOid } from "./utils";

export class OttpClient {
    private readonly configuration: OttpClientConfiguration;

    constructor(configuration: OttpClientConfiguration) {
        this.configuration = configuration;        
    }
    
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
        console.log(attestations)
        return attestations
    }

    createOttpAttestation = async () => {}

    getCollaborators = async () => {}

    getOttpId = async (fid: number) => {
        const oid = await getOid(fid)
        return oid
    }
}

