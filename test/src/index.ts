import { fetchGqlApi, getOid, parseData, fetchAttestations, fetchBy, getEthAddresses, getOidFromContract, createAttestation} from "./utils"



const main = async () => {
    //const attestData = await fetchAttestations(1712949275)
    //console.log(attestData.attestations.length)
    //console.log(await getOid('0x4d11740513ab4729dc298383253d4c9ca98f66fdcc6896d793befac6db5ce7de' as `0x{string}`))
    //parseData()
    //const attestations = await fetchBy("attester", "0x0ed18cFf1e16Db3f8b76D05c84182E4849ab03D4")
    //console.log(attestations)
    //console.log(attestations?.length)
    //const addrs = await getEthAddresses(99)
    //console.log(addrs)
    //const oid = await getOidFromContract(99)
    //console.log(oid)
    const msg = {"toFID":"367273","message":"We built the @ottp schema together!","project":["ottp"]}
    const tx = await createAttestation(316300, JSON.stringify(msg))
    console.log(tx)
}

main()