import { ObjectId } from "mongodb";

interface AttestData {
    "fromFID": string,
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
    "txid": string,
    "refUID": string  
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
        "refUID": string,
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
    refUID: string;
    decodedAttestData: AttestData;
}

export { AttestData, AttestationsData, Attestations, AttestationDocument, }