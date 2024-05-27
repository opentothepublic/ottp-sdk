import axios from "axios"
import { createPublicClient, http, createWalletClient, custom, PublicClient } from 'viem'
import { base } from 'viem/chains'
import { AtnInfo, AttestationDocument } from "./interface"
import { abi } from "./contracts/OIDRegistryProxyAbi"
import { easAbi } from "./contracts/easAbi"
import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import 'viem/window'

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

const getFids = async(text: string): Promise<string> => {
    if (!text)
        throw new Error ('Fnames cannot be empty')
    try {
        if(validateCollabUserInput(text)) {
            const fnames: string[] = getTaggedData(text)     
            let fidArray: string[] = []
            if (!fnames){
                return fidArray.toString()
            } else {
                for (let fname of fnames) {
                    fidArray.push(await getFidFromFname(fname))
                }            
                return fidArray.toString()
            }
        } else {
            throw new Error('Unsupported string was passed.')
        }
        
    } catch (err) {
        throw(err)
    }
}

const validateCollabUserInput = (text: string): boolean => {
    // Identify segments starting with '@' and possibly followed by any characters
    // except for spaces, punctuation, or special characters (excluding '@').
    //const segments = text.match(/@\w+/g) || []; //This allowed only letters, numbers, and underscores within segments.
    //const segments = text.match(/@\w+(\.\w+)*\b/g) || []; //This updated regular expression allows for segments starting with "@" followed by any combination of letters, numbers, underscores, and periods.
    const regex = /@[a-zA-Z0-9_.-]+-?\b/g //Updated regex to allow usernames starting with @ followed by alphanumeric characters, dot, underscore or hyphen
    const segments = text.match(regex) || [];

    // Validate that the original text only contains the valid segments and separators.
    // Rebuild what the valid text should look like from the segments.
    const validText = segments.join(' '); // Using space as a generic separator for validation.

    // Further process the text to remove all valid segments, leaving only separators.
    // This step checks if there are any extra characters or segments that don't start with '@'.
    //const remainingText = text.replace(/@\w+/g, '').trim();
    //const remainingText = text.replace(/@\w+(\.\w+)*\b/g, '').trim(); // The updated regular expression will allow a dot
    const remainingText = text.replace(regex, '').trim(); 

    // Check if the remaining text contains only spaces, punctuation, or special characters (excluding '@').
    // This can be adjusted based on the specific separators you expect between words.
    //const isValidSeparators = remainingText.length === 0 || /^[^@\w]+$/g.test(remainingText);
    //const isValidSeparators = remainingText.length === 0 || /^[^@\w.]+$/g.test(remainingText); //It removes dot as a separater
    const isValidSeparators = remainingText.length === 0 || /^[^@\w.-]+$/g.test(remainingText);
    
    // Ensure every identified segment starts with '@' and contains no additional '@'.
    //const isValidSegments = segments.every(segment => segment.startsWith('@') && !segment.slice(1).includes('@'));
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

const getEthAddresses = async (fid: string): Promise<string[]> => {
    try {
        const res = await axios.get(`https://ottpapi-6k6gsdlfoa-el.a.run.app/api/eth_addresses?fid=${fid}`)
        return res.data?.data
    } catch (e) {
        console.error(e)
        return []
    }
}

const refreshAttestations = async () => {
    try {
        const res = await axios.get('https://ottpapi-6k6gsdlfoa-el.a.run.app/api/fetch')
        return res.data?.status
    } catch (e) {
        console.error(e)
    }
}

const getAttestations_1 = async (addr: string): Promise<AttestationDocument[]> => {
    try {
        await refreshAttestations()
        const res = await axios.get(`https://ottpapi-6k6gsdlfoa-el.a.run.app/api/attestations?attester=${addr}`)
        return res.data?.data
    } catch (e) {
        console.error(e)
        return []
    }
}

const getOid = async (fid: number): Promise<number|null> => {
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
        return null
    }    
}

const createAttestation = async (account: any,  fromFid: number, data: string): Promise<`0x${string}`> => {

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
    if (typeof window !== "undefined") {                
        const walletClient = createWalletClient({
            chain: base,
            transport: custom(window.ethereum!)
        })
        const tx = await walletClient.writeContract({
            address: '0x4200000000000000000000000000000000000021',
            abi: easAbi,
            functionName: 'attest',
            account: account,
            args: [functionData]
        })
        console.log(tx)
        return tx
    } else {
        console.error('Error: metamask or other provider is not installed')
        throw new Error('Metamask or other provider is not installed')
    }
}

const getCollabs = async(fid: string, documents: AttestationDocument[]): Promise<string[] | null> => {
    let collabs: string[] = []
    documents.map(document => {
        if (document.decodedAttestData.fromFID === fid) {
            const collab1 = document.decodedAttestData.toFID.split(',').filter(id => id.trim() !== fid && id.trim() !== '') 
            collabs = [...collabs, ...collab1]     
        } else {
            let collab2 = [document.decodedAttestData.fromFID]
            const collab3 = document.decodedAttestData.toFID.split(',').filter(id => id.trim() !== fid  && id.trim() !== '')
            collabs = [...collabs, ...collab2, ...collab3]
        }        
    })
    const collaborators: string[] = Array.from(new Set(collabs))
    return collaborators 
}

const getAttestationsByFid = async (fid: string): Promise<AttestationDocument[]> => {
    try {
        await refreshAttestations()
        const res = await axios.get(`https://ottpapi-6k6gsdlfoa-el.a.run.app/api/fetchbyfid?fid=${fid}`)
        return res.data?.data
    } catch (e) {
        console.error(e)
        return []
    }
}

const getUserInfo = async (fids: string): Promise<any[]|null> => {
    try {
        const response = await axios.get(`https://ottpapi-6k6gsdlfoa-el.a.run.app/api/userInfo?fids=${fids}`)
        console.log(response.data)  
        return response.data?.data
    } catch (e) {
        console.error(e)
        return null
    }
}

const getAttestations = async(fid: string, documents: AttestationDocument[], userInfo?: boolean): Promise<AtnInfo | null> => {
    let collabs: string[] = []
    let attestationDetails: AtnInfo = {
        atnMade: [],
        atnRcvd: []
    } 
    documents.map(document => {        
        if (document.decodedAttestData.fromFID === fid) {
            attestationDetails.atnMade.push(document)
            const collab1 = document.decodedAttestData.toFID.split(',').filter(id => id.trim() !== fid && id.trim() !== '') 
            collabs = [...collabs, ...collab1]
        } else {
            attestationDetails.atnRcvd.push(document)
            let collab2 = [document.decodedAttestData.fromFID]
            const collab3 = document.decodedAttestData.toFID.split(',').filter(id => id.trim() !== fid  && id.trim() !== '')
            collabs = [...collabs, ...collab2, ...collab3]
        }        
    })
    const collaborators: string[] = Array.from(new Set(collabs))
    if (userInfo) {
        attestationDetails.userInfo = (await getUserInfo(collaborators.toString()))!
    }
    return attestationDetails
}


export {getFids, getNewAttestId, getAttestations, getEthAddresses, getOid, createAttestation, getAttestationsByFid, getCollabs}