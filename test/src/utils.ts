import axios from 'axios'
import { createPublicClient, encodeFunctionData, getContract, http, parseAbiItem } from 'viem'
import { base } from 'viem/chains'
import { Db, MongoClient } from "mongodb"
import dotenv from "dotenv"
import { abi } from './abi'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { easAbi } from './easAbi'
import { createWalletClient, custom } from 'viem'



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

interface Attestations {
    attestations: [{
        "id": string,
        "attester": string,
        "revocable": boolean,
        "time": number,
        "decodedDataJson": string,
        "revoked": boolean,
        "revocationTime": number,
        "schemaId": string,
        "txid": string
    }]
    
}

const fetchAttestations = async (lastFetched?: number | null): Promise<Attestations> => {

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
        }
    }`

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
    const response: {data: Attestations} = await fetchGqlApi(query, variables)
    return response.data
}




const publicClient = createPublicClient({
    chain: base,
    transport: http()
})

const getOid = async (txnHash: `0x{string}`) => {
    try {
        const logs = await publicClient.getTransactionReceipt({
            hash : txnHash
        })
        if (logs.logs[1]?.topics[1]) {
            let oidHex = logs.logs[1]?.topics[1] 
            console.log(oidHex)            
            return parseInt(oidHex as string, 16)
        } else return null
    } catch (err) {
        console.log(err)
    }
}

const parseData = async () => {
    const jsonString = "[{\"name\":\"fromFID\",\"type\":\"uint256\",\"signature\":\"uint256 fromFID\",\"value\":{\"name\":\"fromFID\",\"type\":\"uint256\",\"value\":{\"type\":\"BigNumber\",\"hex\":\"0x1a82\"}}},{\"name\":\"data\",\"type\":\"string\",\"signature\":\"string data\",\"value\":{\"name\":\"data\",\"type\":\"string\",\"value\":\"{\\\"toFID\\\":\\\"5848\\\",\\\"message\\\":\\\"Facilitated a 4-week co-learning experience on \\\\\\\"Systems Transformation\\\\\\\" for @superbenefit and /ccs . Website: https://web3hatchery.my.canva.site/systems-transformation\\\",\\\"project\\\":[\\\"superbenefit\\\"]}\"}}]";
    
    try {
        const jsonData = JSON.parse(jsonString);        
        const attestData = JSON.parse(jsonData[1].value.value)
        console.log(attestData)
        return attestData;
    } catch (error) {
        console.error('Failed to parse JSON string:', error);
    }
}

dotenv.config()

interface AttestData {
    "toFID": string,
    "message": string,
    "project": string[]
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

const url = process.env.MONGO!

const client = new MongoClient(url)

const fetchBy = async(parameter: string, value: string) => {
    try {
        await client.connect()
        const db: Db = client.db(process.env.DB)
        const collection = db.collection(process.env.COLLECTION!)
        const query = {[parameter]: value}
        const documents = await collection.find(query).toArray()
        return documents
    } catch (e) { 
        console.error(e)
    }   
}

const getEthAddresses = async(fid: number) => {
    const options = {
        method: 'GET',
        url: `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid.toString()}&viewer_fid=3`,
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

const getOidFromContract = async (fid: number) => {
    try {
        const oid = await publicClient.readContract({
            address: '0x9D3eD1452A5811e2a4653A9c8029d81Ca99b817f',
            abi: abi,
            functionName: 'getOid',
            args: [fid]
          })
                
        console.log("OID:", Number(oid))
        return Number(oid)
    } catch (e) {
        console.error(e)
    }    
}

const createAttestation = async (fromFid: number, data: string) => {

    const client = createWalletClient({
        chain: base,
        transport: custom(window.ethereum!)
    })
    const [address] = await client.getAddresses() 
    const schemaEncoder = new SchemaEncoder("uint256 fromFID,string data")
    const encodedData = schemaEncoder.encodeData([
	    { name: "fromFID", value: fromFid, type: "uint256" },
	    { name: "data", value: JSON.stringify(data), type: "string" }	        
    ])
    console.log(encodedData)
      
    const functionData = {
        schema: '0x8b3daa42a5d5a0957751f262a32f42a01e6def0b9ef91fdec889945ff13e5d67',
        data: {
            recipient: "0x0000000000000000000000000000000000000000",
            expirationTime: 0,
            revocable: true,
            refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
            data: encodedData,
            value: 0,
        }
    }

    const tx = await client.writeContract({
        address: '0x4200000000000000000000000000000000000021',
        abi: easAbi,
        functionName: 'attest',
        account: address,
        args: [functionData]
    })

    console.log(tx)
    
}

export {fetchGqlApi, getOid, parseData, fetchAttestations, fetchBy, getEthAddresses, getOidFromContract, createAttestation}
