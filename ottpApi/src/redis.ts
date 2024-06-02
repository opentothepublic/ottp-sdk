import { createClient } from 'redis'
import dotenv from "dotenv"

dotenv.config()

const redisCloudClient = createClient({
    password: process.env.REDISCLOUD_PSWD,
    socket: {
        host: process.env.REDISCLOUD_HOST,
        port: 12343
    }
})

const setLastFetched = async (value: number) => {
    try {
        const client = await redisCloudClient.connect()
        await client.set('lastFetched', value)
        console.log(await client.get('lastFetched'))
        await client.disconnect()
    } catch (err) {
        console.error(err)
    }
}

const getLastFetched = async (): Promise<number|null> => {
    try {
        const client = await redisCloudClient.connect()
        const lastFetched = Number(await client.get('lastFetched'))
        await client.disconnect()
        return lastFetched
    } catch (err) {
        console.error(err)
        return null
    }
}

export { setLastFetched,  getLastFetched }