import cors from "cors"
import "dotenv/config"
import express from "express"
import { apiKey } from "./serverClient"

const app = express()
app.use(express.json())
app.use(cors({
    origin:"*"
}))

app.get("/", (req, res)=>{
    res.json({
        message:"open ai agent is running now",
        apiKey
    })
})

const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log(`server is running at http://localhost:${port}`)
})