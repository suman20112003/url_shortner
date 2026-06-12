require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const express = require('express')
const app = express()

const indexRouter = require('./routes/index')

const PORT = Number.parseInt(String(process.env.PORT || 5000).replace(/;\s*$/, ''), 10)

app.set('trust proxy', true)

app.get('/test', (req, res) => {
    res.send('test route')
})

// Enable CORS for all origins
app.use(cors())
app.use(express.json())
app.use('/', indexRouter)

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
})
.then(() => console.log('Database connection successfull'))
.catch((err) => console.log('error in db connection', err));

const server = app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`)
        process.exit(1)
    }

    throw err
})

function shutdown(signal) {
    server.close(() => {
        mongoose.connection.close(false).finally(() => {
            process.exit(0)
        })
    })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGUSR2', () => {
    shutdown('SIGUSR2')
    process.kill(process.pid, 'SIGUSR2')
})