import { OttpClientConfiguration } from "./interface";

export class OttpClient {
    private readonly configuration: OttpClientConfiguration;

    constructor(configuration: OttpClientConfiguration) {
        this.configuration = configuration;        
    }
    
    getOttpAttestations = async () => {}

    createOttpAttestation = async () => {}

    getCollaborators = async () => {}

    getAttestationMsg = async () => {}

    getOttpId = async () => {}
}