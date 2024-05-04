import axios from 'axios'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { base } from 'viem/chains'

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

export {fetchGqlApi, getOid, parseData, fetchAttestations}
