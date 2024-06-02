import { Db, MongoClient, WithId } from "mongodb"
import dotenv from "dotenv"
import axios from "axios"
import { AttestData, AttestationDocument, Attestations, AttestationsData } from './interface'
import { insertRecords } from "./mongo"
import { setLastFetched, getLastFetched } from "./redis"

dotenv.config()

const url = process.env.MONGO!
const client = new MongoClient(url)

const fetchBy = async(attester: string): Promise<WithId<AttestationDocument>[] | null> => {
    try {
        await client.connect()
        const db: Db = client.db(process.env.DB)
        const collection = db.collection<AttestationDocument>(process.env.COLLECTION!)
        const query = {attester: attester.toLowerCase()}
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

const fetchGqlApi = async (query: string, variables?: object): Promise<any> => {
    const url = 'https://base.easscan.org/graphql'
    const headers = { 'Content-Type': 'application/json' }
    const body = JSON.stringify({ query, variables})

    try {
        const response = await axios.post(url, body, {headers})
        if (response.status !== 200) {
            throw new Error(`Error: ${response.status}`)
        }
        return response.data
    } catch (e) {
        console.error(e)
    }
}

const fetchAttestations = async (): Promise<Attestations[] | null> => {

    const query = `query Attestations($where: AttestationWhereInput) {
        attestations(orderBy: {time: desc}, where: $where) {
          id
          attester
          revocable
          time
          decodedDataJson
          revoked
          revocationTime
          schemaId
          txid
          refUID
        }
    }`

    let lastFetched = await getLastFetched()
    console.log('Last fetched: ',lastFetched)

    const variable1 = {
        "where": {
            "schemaId": {
              "equals": "0x8b3daa42a5d5a0957751f262a32f42a01e6def0b9ef91fdec889945ff13e5d67"
            },
            "time": {
              "gt": lastFetched
            }
        }
    }
    const variable2 = {
        "where": {
            "schemaId": {
              "equals": "0x8b3daa42a5d5a0957751f262a32f42a01e6def0b9ef91fdec889945ff13e5d67"
            }
        }
    }
    const variables = lastFetched ? variable1 : variable2
    const response = await fetchGqlApi(query, variables)     
    const data: Attestations[] = response.data.attestations.length > 0 ? response.data.attestations : null
    if ( data ) {
        await setLastFetched(data[0].time)
        return data
    } else {
        return null
    }
}

const sendAttestations = async (): Promise<AttestationsData[]|null> => {
    const attestData = await fetchAttestations()
    if (attestData && attestData.length > 0) {
        const attestations = attestData
        let attestationData: AttestationsData[] = []    
        const modAttestationData = attestations.map(attestation => ({
            id: attestation.id,
            attester: attestation.attester.toLowerCase(),                
            revocable: attestation.revocable,
            time: attestation.time,      
            revoked: attestation.revoked,
            revocationTime: attestation.revocationTime,
            schemaId: attestation.schemaId,
            txid: attestation.txid,
            refUID: attestation.refUID,
            decodedAttestData: parseData(attestation.decodedDataJson)!
        }))
        attestationData = modAttestationData
        //console.log(util.inspect(attestationData, {depth: null}))
        //console.log(modAttestationData)
        return attestationData
    } else return null
}


const parseData = (jsonString: string): AttestData | null => {      
    try {
        const jsonData = JSON.parse(jsonString);        
        var attestData: AttestData = {
            fromFID: "",
            toFID: "",
            message: "",
            project: []
        }
        attestData.fromFID = parseInt(jsonData[0].value.value.hex, 16).toString()
        var partAttestData = JSON.parse(jsonData[1].value.value)
        attestData = { ...attestData , ...partAttestData}
        //console.log(attestData)
        return attestData;
    } catch (error) {
        console.error('Failed to parse JSON string:', error)
        return null
    }
}

const getAttestations = async () => {
    let attestData = await sendAttestations()
    if (attestData && attestData.length > 0) {
        await insertRecords(attestData)
        console.log(`Fetched and sent ${attestData.length} attestations @ ${Date.now()}`)            
    } else console.log(`Nothing to fetch @ ${Date.now()}`)
}

const fetchByFID = async(fid: string): Promise<WithId<AttestationDocument>[] | null> => {
    try {
        await client.connect()
        const db: Db = client.db(process.env.DB)
        const collection = db.collection<AttestationDocument>(process.env.COLLECTION!)
        const regex = new RegExp(fid)
        const query1 = {"decodedAttestData.fromFID": {$regex: regex}}
        const query2 = {"decodedAttestData.toFID": {$regex: regex}}
        const documentsFrom = await collection.find(query1).toArray()
        const documentsTo = await collection.find(query2).toArray()
        
        return [...documentsFrom, ...documentsTo]
    } catch (e) { 
        console.error(e)
        return []
    } finally {
        await client.close()
    }
}

const getUserInfo = async (fids: string): Promise<any[]|null> => {
    const options = {
        method: 'GET',
        url: `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fids}&viewer_fid=3`,
        headers: {accept: 'application/json', api_key: process.env.NEYNAR_API_KEY}
    }
    try {
        const response = await axios.request(options)
        console.log(response.data)  
        return response.data?.users
    } catch (e) {
        console.error(e)
        return null
    }
}

const getFidFromFname = async (fname: string): Promise<string> => { 
    if (!fname) 
        throw new Error ('Fname cannot be empty')
    try {        
        const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/search?q=${fname}&viewer_fid=3`, {
            headers: {
                accept: 'application/json',
                api_key: process.env.NEYNAR_API_KEY,                
            }
        })
        return response.data?.result.users[0].fid
    } catch (err) {
        throw(err)
    }
}

export {parseData, getAttestations, getEthAddresses, fetchBy, fetchByFID, getUserInfo, getFidFromFname, AttestData, AttestationsData}