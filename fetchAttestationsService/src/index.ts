import { parseData, AttestationsData, sendAttestations} from "./utils"
import { insertRecords } from "./mongo"


const getAttestations = async () => {
    let attestData = await sendAttestations()
    if (attestData && attestData.length > 0) {
        await insertRecords(attestData)
        console.log(`Fetched and sent ${attestData.length} attestations @ ${Date.now()}`)            
    } else console.log(`Nothing to fetch @ ${Date.now()}`)
}

const main = async (intervalMinutes: number) => {
   // const attestData = await fetchAttestations()
    //console.log(attestData.attestations)
    //if (attestData) console.log(`Fetched ${attestData.attestations.length} attestations @ ${Date.now()}`)
    //console.log(await getOid('0x4d11740513ab4729dc298383253d4c9ca98f66fdcc6896d793befac6db5ce7de' as `0x{string}`))
    //parseData()
    await getAttestations()    
    setInterval(async () => {
        await getAttestations()
    }, intervalMinutes * 60 * 1000)
}

main(2)