const express = require('express');
const router = express.Router();
const moviesController = require('../../controllers/api/movies_controller_api');

//For merging local db items and items from omdb server
router.get('/:id', moviesController.getMergedMovieObject);

//For searching in our catalogue using query params
router.get('/', moviesController.searchByParameters);

module.exports = router;