'use strict';
const express = require('express');
const xss = require('xss');
const noteRouter = express.Router();
const bodyParser = express.json();
const noteService = require('./note-service');

noteRouter
  .route('/')
  .get((req, res, next) => {
    noteService
      .getAllNote(req.app.get('db'))
      .then(notes => {
        let newNotes = notes.map(note => {
          return {
            id: note.id.toString(),
            name: xss(note.note_name),
            content: xss(note.content),
            folderId: note.folder_id.toString(),
            modified: note.modified
          };
        });
        return newNotes;
      })
      .then(sanitizedFolders => {
        res.json(sanitizedFolders);
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const { name, folderId, content, modified } = req.body;
    const newNote = { note_name: name, folder_id: folderId, content, modified };

    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    noteService
      .addNote(req.app.get('db'), newNote)
      .then(note => {
        res
          .status(201)
          .location(`http://localhost:8080/note/${note.id}`)
          .json({
            id: note.id.toString(),
            name: xss(note.note_name),
            content: xss(note.content),
            folderId: note.folder_id.toString(),
            modified: note.modified
          });
      })
      .catch(next);
  });

noteRouter
  .route('/:id')
  .get((req, res, next) => {
    const { id } = req.params;
    noteService.getNoteById(req.app.get('db'), id).then(note => {
      if (!note) {
        res.status(400).send('This note does not exist');
      }
      res
        .json({
          id: note.id.String(),
          name: xss(note.note_name),
          content: xss(note.content),
          folderId: note.folder_id,
          modified: note.modified
        })
        .catch(next);
    });
  })
  .delete(bodyParser, (req, res) => {
    const { id } = req.params;
    noteService.deleteNote(req.app.get('db'), id).then(note => {
      res.status(204).send('Bookmark deleted');
    });
  });

module.exports = noteRouter;