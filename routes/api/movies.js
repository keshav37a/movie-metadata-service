const express = require('express');
const router = express.Router();
const moviesController = require('../../controllers/api/movies_controller_api');

router.get('/', moviesController.home);
router.get('/:id', moviesController.getMergedMovieObject);

module.exports = router;