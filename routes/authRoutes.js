const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.get('/home',authController.home);

module.exports = router;