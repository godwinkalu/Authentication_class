const express = require('express')
require("./config/database")
const cors = require('cors')
const userRouter  = require('./routes/userRouter')
const port = process.env.port || 8999

const app = express()
app.use(express.json())
app.use(cors('*'))
app.use(userRouter)

app.listen(port, ()=>{
  console.log(`my server is running on port:${port}`);
  
})