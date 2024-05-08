import express from "express"
import cors from 'cors'
import { fetchBy, getAttestations, getEthAddresses } from "./utils"

const app = express()
app.use(cors())

const port = process.env.PORT || 3000

app.get("/api", (req, res) => {
    res.send("OK!");
})

app.get("/api/attestations", async (req, res) => {
    if (!req.query.attester){
        return res.status(400).send('Attester not found!')
    }    
    const attester = req.query.attester
    const attestations = await fetchBy(attester as string)
    console.log(`Returned ${attestations?.length} attestation records`)
    res.send({ status: 'OK', data: attestations});
})

app.get("/api/eth_addresses", async (req, res) => {
    if (!req.query.fid){
        return res.status(400).send('Attester not found!')
    }    
    const fid = req.query.fid
    const addrs = await getEthAddresses(fid.toString())
    console.log(`Returned ${addrs?.length} addresses`)
    res.send({ status: 'OK', data: addrs});
})

app.get("/api/fetch", async (req, res) => {
    await getAttestations()
    return res.send({ status: 'OK' })
})

app.listen(port, () => console.log(`App running on port ${port}...`))