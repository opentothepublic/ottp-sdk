import express from "express"
import cors from 'cors'
import { fetchBy, fetchByFID, getAttestations, getEthAddresses, getFidFromFname, getUserInfo } from "./utils"

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
        return res.status(400).send('Fid not found!')
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

app.get("/api/fetchbyfid", async (req, res) => {
    if (!req.query.fid){
        return res.status(400).send('FID not found!')
    }    
    const fid = req.query.fid
    const attestations = await fetchByFID(fid as string)
    console.log(`Returned ${attestations?.length} attestation records.`)
    res.send({ status: 'OK', data: attestations});
})

app.get("/api/userInfo", async (req, res) => {
    if (!req.query.fids){
        return res.status(400).send('FIDs not found!')
    } 
    const fids = req.query.fids
    const userInfo = await getUserInfo(fids as string)
    return res.send({ status: 'OK', data: userInfo })
})

app.get("/api/getFid", async (req, res) => {
    if (!req.query.fname){
        return res.status(400).send('FID not found!')
    } 
    const fname = req.query.fname
    const fid = await getFidFromFname(fname as string)
    return res.send({ status: 'OK', data: fid })
})

app.listen(port, () => console.log(`App running on port ${port}...`))