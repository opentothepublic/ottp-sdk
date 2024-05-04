import axios from 'axios'
import { readFileSync, writeFileSync } from 'fs'
import util from 'util'
import { insertRecords } from './mongo'

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

const getLastFetched = () : number | null => {
    try {
        const data = readFileSync('src/lastFetched.txt', 'utf8')
        return data.trim().length > 0 ? Number(data) : null
    } catch (error) {
        return null; // Return null if file doesn't exist
    }
}

const saveLastFetched = (time: number) => {
    writeFileSync('src/lastFetched.txt', time.toString(), 'utf8');
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
        }
    }`

    let lastFetched = getLastFetched()

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
        saveLastFetched(data[0].time)
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
            attester: attestation.attester,                
            revocable: attestation.revocable,
            time: attestation.time,      
            revoked: attestation.revoked,
            revocationTime: attestation.revocationTime,
            schemaId: attestation.schemaId,
            txid: attestation.txid,
            decodedAttestData: parseData(attestation.decodedDataJson)!
        }))
        attestationData = modAttestationData
        console.log(util.inspect(attestationData, {depth: null}))
        return attestationData
    } else return null
}


const parseData = (jsonString: string): AttestData | null => {
    //const jsonString = "[{\"name\":\"fromFID\",\"type\":\"uint256\",\"signature\":\"uint256 fromFID\",\"value\":{\"name\":\"fromFID\",\"type\":\"uint256\",\"value\":{\"type\":\"BigNumber\",\"hex\":\"0x1a82\"}}},{\"name\":\"data\",\"type\":\"string\",\"signature\":\"string data\",\"value\":{\"name\":\"data\",\"type\":\"string\",\"value\":\"{\\\"toFID\\\":\\\"5848\\\",\\\"message\\\":\\\"Facilitated a 4-week co-learning experience on \\\\\\\"Systems Transformation\\\\\\\" for @superbenefit and /ccs . Website: https://web3hatchery.my.canva.site/systems-transformation\\\",\\\"project\\\":[\\\"superbenefit\\\"]}\"}}]";
    
    try {
        const jsonData = JSON.parse(jsonString);        
        const attestData: AttestData = JSON.parse(jsonData[1].value.value)
        //console.log(attestData)
        return attestData;
    } catch (error) {
        console.error('Failed to parse JSON string:', error)
        return null
    }
}


export {parseData, sendAttestations, AttestData, AttestationsData}
