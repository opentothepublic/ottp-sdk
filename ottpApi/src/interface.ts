import { ObjectId } from "mongodb";

interface AttestData {
    "toFID": string,
    "message": string,
    "project": string[]
}

interface Attestations {
    "id": string,
    "attester": string,
    "revocable": boolean,
    "time": number,
    "decodedDataJson": string,
    "revoked": boolean,
    "revocationTime": number,
    "schemaId": string,
    "txid": string    
}

interface AttestationsData {
        "id": string,
        "attester": string,
        "revocable": boolean,
        "time": number,        
        "revoked": boolean,
        "revocationTime": number,
        "schemaId": string,
        "txid": string,
        "decodedAttestData": AttestData    
}

interface AttestationDocument {
    _id: ObjectId;
    id: string;
    attester: string;
    revocable: boolean;
    time: number;
    revoked: boolean;
    revocationTime: number;
    schemaId: string;
    txid: string;
    decodedAttestData: AttestData;
}

export { AttestData, AttestationsData, Attestations, AttestationDocument, }