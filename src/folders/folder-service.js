'use strict';
const FolderService = {
  getAllFolder(knexInstance) {
    return knexInstance
      .select('*')
      .from('folder')
      .then(folder => {
        return folder;
      });
  },

  addFolder(knexInstance, folder) {
    return knexInstance
      .insert(folder)
      .into('folder')
      .returning('*')
      .then(folder => {
        return folder[0];
      });
  },

  getById(knexInstance, id) {
    return knexInstance
      .from('folder')
      .select('*')
      .where('id', id)
      .first();
  }
};
module.exports = FolderService;