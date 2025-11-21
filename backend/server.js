require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')

console.log('URL:', process.env.DATABASE_URL)
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const ratingsRouter = require('./routes/ratings')
app.use('/ratings', ratingsRouter)

app.listen(8000, () => console.log('Server is running on port 8000'))