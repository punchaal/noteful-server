'use strict';
const express = require('express');
const xss = require('xss');
const folderRouter = express.Router();
const bodyParser = express.json();
const folderService = require('./folder-service');

folderRouter
  .route('/')
  .get((req, res, next) => {
    folderService
      .getAllFolder(req.app.get('db'))
      .then(folders => {
        let newFolders = folders.map(folder => {
          return { id: folder.id.toString(), name: xss(folder.folder_name) };
        });
        return newFolders;
      })
      .then(sanitizedFolders => {
        res.json(sanitizedFolders);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).send('Folder name is required');
    }

    folderService
      .addFolder(req.app.get('db'), { folder_name: name })
      .then(folder => {
        res
          .status(201)
          .location(`http://localhost:8080/api/folder/${folder.id}`)
          .json({ id: folder.id.toString(), name: xss(folder.folder_name) });
      })
      .catch(next);
  });

folderRouter.route('/:id').get((req, res, next) => {
  const { id } = req.params;
  folderService
    .getById(req.app.get('db'), id)
    .then(folder => {
      if (!folder) {
        res.status(400).send('This folder does not exist');
      }
      res.json({ id: folder.id.toString(), name: xss(folder.folder_name) });
    })
    .catch(next);
});

module.exports = folderRouter;