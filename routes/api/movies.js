const express = require('express');
const router = express.Router();
const moviesController = require('../../controllers/api/movies_controller_api');

router.get('/:id', moviesController.getMergedMovieObject);
router.get('/', moviesController.searchByParameters);

module.exports = router;