import axios from "axios"
import { AxiosResponse } from 'axios'
import { createPublicClient, http, getContract } from 'viem'
import { base } from 'viem/chains'
import { AttestationDocument } from "./interface"
import { abi } from "./contracts/OIDRegistryProxyAbi"

const getFnameFromFid = async (fid: number): Promise<string> => { 
    if (!fid) 
        throw new Error ('Fid cannot be empty')
    try {        
        const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}&viewer_fid=316300`, {
            headers: {
                accept: 'application/json',
                api_key: process.env.NEYNAR_API_KEY,                
            }
        })
        //console.log(response.data)        
        //return response.data?.transfers[0].username
        return response.data?.users[0].username
    } catch (err) {
        throw(err)
    }
}

const getFidFromFname = async (fname: string): Promise<string> => { 
    if (!fname) 
        throw new Error ('Fname cannot be empty')
    try {        
        const response = await axios.get(`https://api.neynar.com/v2/farcaster/user/search?q=${fname}&viewer_fid=316300`, {
            headers: {
                accept: 'application/json',
                api_key: process.env.NEYNAR_API_KEY,                
            }
        })
        //console.log(response.data)        
        //return response.data?.transfers[0].id
        return response.data?.result.users[0].fid
    } catch (err) {
        throw(err)
    }
}

const getTaggedData = (text: string): string[] => {
    const taggedDataPattern = /@\w+/g            
    const matches = text.match(taggedDataPattern)            
    if (!matches) {
        return [];
    }
    return matches.map(taggedData => taggedData.substring(1));
}

const getFids = async(text: string): Promise<string[]> => {
    if (!text)
        throw new Error ('Fnames cannot be empty')
    try {
        const fnames: string[] = getTaggedData(text)     
        let fidArray: string[] = []
        if (!fnames){
            return fidArray
        } else {
            for (let fname of fnames) {
                fidArray.push(await getFidFromFname(fname))
            }            
            return fidArray
        }
    } catch (err) {
        throw(err)
    }
}

const validateCollabUserInput = (text: string): boolean => {
    // Identify segments starting with '@' and possibly followed by any characters
    // except for spaces, punctuation, or special characters (excluding '@').
    const segments = text.match(/@\w+/g) || [];

    // Validate that the original text only contains the valid segments and separators.
    // Rebuild what the valid text should look like from the segments.
    const validText = segments.join(' '); // Using space as a generic separator for validation.

    // Further process the text to remove all valid segments, leaving only separators.
    // This step checks if there are any extra characters or segments that don't start with '@'.
    const remainingText = text.replace(/@\w+/g, '').trim();

    // Check if the remaining text contains only spaces, punctuation, or special characters (excluding '@').
    // This can be adjusted based on the specific separators you expect between words.
    const isValidSeparators = remainingText.length === 0 || /^[^@\w]+$/g.test(remainingText);

    // Ensure every identified segment starts with '@' and contains no additional '@'.
    const isValidSegments = segments.every(segment => segment.startsWith('@') && !segment.slice(1).includes('@'));

    // The text is valid if the separators are valid, and all segments start with '@' without additional '@'.
    return isValidSegments && isValidSeparators;
}

const publicClient = createPublicClient({
    chain: base,
    transport: http()
})

const getNewAttestId = async (txnId: string): Promise<any> => {
    try {        
        const hash = txnId as `0x${string}`
        const transactionReceipt = await publicClient.waitForTransactionReceipt({ hash })
        
        console.log(transactionReceipt)
        console.log(transactionReceipt.logs[0].data)
        return transactionReceipt.logs[0].data

    } catch (e) {
        console.error(e)
        return e
    }
}

const getFnames = async (toFids: string): Promise<string> => {
    const fidArray: string[] = toFids.split(',')    
    const fnamePromises: Promise<string>[] = fidArray.map(fid => getFnameFromFid(Number(fid)));
    const fnameArray: string[] = await Promise.all(fnamePromises);
    const prefixedFnames: string = fnameArray.map(name => '@' + name).join(' ')
    return prefixedFnames
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

const getEthAddresses = async (fid: string): Promise<string[]> => {
    try {
        const res = await axios.get(`http://localhost:3000/api/eth_addresses?fid=${fid}`)
        return res.data?.data
    } catch (e) {
        console.error(e)
        return []
    }
}

const getAttestations = async (addr: string): Promise<AttestationDocument[]> => {
    try {
        const res = await axios.get(`http://localhost:3000/api/attestations?attester=${addr}`)
        return res.data?.data
    } catch (e) {
        console.error(e)
        return []
    }
}

const getOid = async (fid: number) => {
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



export {getFids, validateCollabUserInput, getTaggedData, getNewAttestId, getAttestations, getEthAddresses, getOid}