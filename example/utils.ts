import axios from 'axios'
import { createPublicClient, encodeFunctionData, getContract, http, parseAbiItem } from 'viem'
import { base } from 'viem/chains'
import { Db, MongoClient } from "mongodb"
import dotenv from "dotenv"
import { abi } from './abi'
import { EAS, SchemaEncoder } from '@ethereum-attestation-service/eas-sdk'
import { easAbi } from './easAbi'
import { createWalletClient, custom } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'




const publicClient = createPublicClient({
    chain: base,
    transport: http()
})





const walletClient = createWalletClient({
    chain: base,
    transport: custom(window.ethereum!)
    
})

const createAttestation = async (account: any,  fromFid: number, data: string) => {

    
    
    //const [account] = await client.getAddresses() 
    //const account = privateKeyToAccount('0x986208D332d69108C759a0a7e7A337a0BEF95e6b')
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

    /*const { request } = await publicClient.simulateContract({
        address: '0x4200000000000000000000000000000000000021',
        abi: easAbi,
        functionName: 'attest',
        account: account,
        args: [functionData]
    })*/
    //const tx = await client.signTransaction(request)
    const tx = await walletClient.writeContract({
        address: '0x4200000000000000000000000000000000000021',
        abi: easAbi,
        functionName: 'attest',
        account: account,
        args: [functionData]
    })
    //const tx = await publicClient.sendRawTransaction(request)
    //const tx: string = '0x00'
    console.log(tx)
    return tx
}

export {createAttestation }
