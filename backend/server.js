// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// const app = express();

// mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true });
// console.log("Connected to MongoDB");

// const allowedOrigins = [
//   'http://127.0.0.1:3000',
//   'http://localhost:3000',
//   'https://recordb.vercel.app',
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // allow server-to-server / curl / Postman
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }

//       return callback(new Error('Not allowed by CORS'));
//     },
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })
// );

// app.options('*', cors());

// app.use(express.json());

// // Routes
// app.use('/ratings', require('./routes/ratings'));
// app.use('/spotify', require('./routes/spotify'));
// app.use('/user', require('./routes/user'));
// app.use('/comments', require('./routes/comments'));

// app.listen(8000, () => console.log('Server running on port 8000'));

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
    origin: ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://recordb.vercel.app', 'https://recordbackend.vercel.app'],        // frontend origin
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json())

const ratingsRouter = require('./routes/ratings')
app.use('/ratings', ratingsRouter)

const spotifyRouter = require('./routes/spotify')
app.use('/spotify', spotifyRouter)

const userRouter = require('./routes/user')
app.use('/user', userRouter)

const commentRouter = require('./routes/comments')
app.use('/comments', commentRouter)

app.listen(8000, () => console.log('Server is running on port 8000'))
