import { Db, MongoClient, ObjectId, WithId } from "mongodb"
import dotenv from "dotenv"
import axios from "axios";

dotenv.config()

interface AttestData {
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

const url = process.env.MONGO!

const client = new MongoClient(url)

const fetchBy = async(attester: string): Promise<WithId<AttestationDocument>[] | null> => {
    try {
        await client.connect()
        const db: Db = client.db(process.env.DB)
        const collection = db.collection<AttestationDocument>(process.env.COLLECTION!)
        const query = {attester: attester}
        const documents = await collection.find(query).toArray()
        return documents
    } catch (e) { 
        console.error(e)
        return []
    } finally {
        await client.close()
    }
}

const getEthAddresses = async(fid: string) => {
    const options = {
        method: 'GET',
        url: `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=3`,
        headers: {accept: 'application/json', api_key: process.env.NEYNAR_API_KEY}
    }
    try {
        const response = await axios.request(options)
        console.log(response.data)  
        return response.data?.users[0].verified_addresses.eth_addresses

    } catch (e) {
        console.error(e)
    }
    
}

export { getEthAddresses, fetchBy}