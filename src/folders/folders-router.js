const path = require('path')
const express = require('express')
const logger = require('../logger')
const xss = require('xss')
const foldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()

const serializeFolders = folder => ({
  id: folder.id,
  name:xss(folder.name),
})

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    foldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolders))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body
    const newFolder = { name }

    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
    foldersService.insertFolder(
      req.app.get('db'),
      newFolder
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolders(folder))
      })
      .catch(next)
  })

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const {folder_id} = req.params
    foldersService.getById(
      req.app.get('db'),
      folder_id
    )
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folder_id} not found.`)
          return res.status(404).json({
            error: { message: `Folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeFolders(res.folder))
  })
  .delete((req, res, next) => {
    const {folder_id} = req.params
    foldersService.deleteFolder(
      req.app.get('db'),
      folder_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

  .patch(jsonParser,(req,res,next)=>{
    const {name} = req.body
    const folderToUpdate = {name}

    const numberOfValues = Object.values(folderToUpdate)
    if(numberOfValues === 0){
      return res.status(400).json({
        error: {
          message: `Request body must contain name of the folder`
        }
      })
    }
    foldersService.updateFolder(
      req.app.get('db'),
      folder_id,
      folderToUpdate
    )
      .then(numRowsAffected =>{
        res.status(204).end()
      })
      .catch(next)
  })


module.exports = foldersRouter