const express = require('express');
const router = express.Router();
const {list,detail,getByName} = require('../controllers/genresController');

router.get('/genres',list);
router.get('/:id',detail);
router.get('/name/:name?',getByName)

module.exports = router;