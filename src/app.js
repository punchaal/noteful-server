require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const validateBearerToken = require('./validate-bearer-token')
const errorHandler = require('./error-handler')
const foldersRouter = require('./folders/folder-router')
const notesRouter = require('./notes/note-router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}))
app.use(cors())
app.use(helmet())
app.use(validateBearerToken)
app.use('/user', function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})
app.use('/api/folders',foldersRouter)
app.use('/api/notes',notesRouter)

app.get('/', (req, res) => {
  res.send('Welcome to the Noteful App')
})

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});


module.exports = app