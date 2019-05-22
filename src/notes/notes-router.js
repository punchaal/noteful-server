const path = require('path')
const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const notesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializeNotes = note => ({
  id: note.id,
  name:xss(note.name),
  content:xss(note.content),
  folder:note.folder,
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    notesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializeNotes))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    for (const field of ['name','content','folder']){
      if(!req.body[field]){
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `${field} is required`}
        })
      }
    }
    const { name,content,folder } = req.body
    
    const newNote = { name,content,folder }

    notesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNotes(note))
      })
      .catch(next)
  })

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    const {note_id} = req.params
    notesService.getById(
      req.app.get('db'),
      note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeNotes(res.note))
  })
  .delete((req, res, next) => {
    const {note_id} = req.params
    notesService.deleteNote(
      req.app.get('db'),
      note_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(jsonParser,(req,res,next)=>{
    const {name} = req.body
    const noteToUpdate = {name}

    const numberOfValues = Object.values(noteToUpdate)
    if(numberOfValues === 0){
      return res.status(400).json({
        error: {
          message: `Request body must contain name of the note`
        }
      })
    }
    const {note_id} = req.params
    notesService.updateNote(
      req.app.get('db'),
      note_id,
      noteToUpdate
    )
      .then(numRowsAffected =>{
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = notesRouter