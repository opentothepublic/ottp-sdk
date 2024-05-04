import { fetchGqlApi, getOid, parseData, fetchAttestations} from "./utils"



const main = async () => {
    const attestData = await fetchAttestations(1712949275)
    console.log(attestData.attestations.length)
    //console.log(await getOid('0x4d11740513ab4729dc298383253d4c9ca98f66fdcc6896d793befac6db5ce7de' as `0x{string}`))
    //parseData()
}

main()