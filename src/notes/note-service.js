'use strict';
const FolderService = {
  getAllNote(knexInstance) {
    return knexInstance
      .select('*')
      .from('note')
      .then(note => {
        return note;
      });
  },

  addNote(knexInstance, note) {
    return knexInstance
      .insert(note)
      .into('note')
      .returning('*')
      .then(note => {
        return note[0];
      });
  },

  getNoteById(knexInstance, id) {
    return knexInstance
      .from('note')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteNote(knexInstance, id) {
    return knexInstance('note')
      .where({ id })
      .delete();
  }
};

module.exports = FolderService;