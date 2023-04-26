const express = require('express');
const router = express.Router();
const homeController = require('../controller/homeController');
const authverify = require('../middleware/authverify')

router.post('/create',authverify.auth,homeController.createPost);


module.exports = router;