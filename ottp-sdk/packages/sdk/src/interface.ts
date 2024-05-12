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

export { AttestData, AttestationDocument }