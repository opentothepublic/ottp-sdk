import { ObjectId } from "mongodb"

interface AttestData {
    fromFID: string,
    toFID: string,
    message: string,
    project: string[]
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

interface AtnInfo {
    atnMade: AttestationDocument[]
    atnRcvd: AttestationDocument[]
    userInfo?: any[]
}

export { AttestData, AttestationDocument, AtnInfo }