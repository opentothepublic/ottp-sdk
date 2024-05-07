import { sendAttestations} from "./utils"
import { insertRecords } from "./mongo"


const getAttestations = async () => {
    let attestData = await sendAttestations()
    if (attestData && attestData.length > 0) {
        await insertRecords(attestData)
        console.log(`Fetched and sent ${attestData.length} attestations @ ${Date.now()}`)            
    } else console.log(`Nothing to fetch @ ${Date.now()}`)
}

const main = async (intervalMinutes: number) => {
    await getAttestations()    
    setInterval(async () => {
        await getAttestations()
    }, intervalMinutes * 60 * 1000)
}

main(5)