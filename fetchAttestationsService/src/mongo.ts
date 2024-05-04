import { Db, MongoClient } from "mongodb"
import dotenv from "dotenv"
import { AttestationsData } from "./utils"
dotenv.config()

const url = process.env.MONGO!
const dbName = process.env.DB

const client = new MongoClient(url)


export const insertRecords = async(attestData: AttestationsData[]) => {    
    try {
        await client.connect()
        const db: Db = client.db(process.env.DB)
        const collection = db.collection(process.env.COLLECTION!)
        const result = await collection.insertMany(attestData)
        console.log(result)
    } catch (e) {
        console.error(e)
    } finally {
        client.close()        
    }
}