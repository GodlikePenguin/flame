const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');

const {
  createBookmark,
  getBookmarks,
  getBookmark,
  updateBookmark,
  deleteBookmark,
  reorderBookmarks
} = require('../controllers/bookmark');

router
  .route('/')
  .post(upload, createBookmark)
  .get(getBookmarks);

router
  .route('/:id')
  .get(getBookmark)
  .put(updateBookmark)
  .delete(deleteBookmark);

router
  .route('/0/reorder')
  .put(reorderBookmarks);

module.exports = router;