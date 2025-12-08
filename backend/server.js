require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')

console.log('URL:', process.env.DATABASE_URL)
mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true})
console.log("connected")

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(cors({
    origin: 'http://127.0.0.1:3000',         // frontend origin
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json())

const ratingsRouter = require('./routes/ratings')
app.use('/ratings', ratingsRouter)

const spotifyRouter = require('./routes/spotify')
app.use('/spotify', spotifyRouter)

const userRouter = require('./routes/user')
app.use('/user', userRouter)

app.listen(8000, () => console.log('Server is running on port 8000'))
