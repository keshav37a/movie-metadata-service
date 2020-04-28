const express = require('express');
const router = express.Router();
const moviesController = require('../../controllers/api/movies_controller_api');

router.get('/', moviesController.home);

module.exports = router;