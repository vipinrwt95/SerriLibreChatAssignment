const express = require('express');
const multer = require('multer');
const path = require('path');

const {
  createContactController,
  getContactsController,
  searchContactsController,
  importContactsController,
  deleteAllContactsController,
} = require('~/server/controllers/ContactsController');

const { requireJwtAuth } = require('~/server/middleware');

const router = express.Router();

const upload = multer({
  dest: path.join(process.cwd(), 'uploads', 'contacts'),
});

router.get('/', requireJwtAuth, getContactsController);
router.post('/', requireJwtAuth, createContactController);
router.get('/search', requireJwtAuth, searchContactsController);
router.post('/import', requireJwtAuth, upload.single('file'), importContactsController);
router.delete('/', requireJwtAuth, deleteAllContactsController);


module.exports = router;