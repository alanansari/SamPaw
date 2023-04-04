const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authverify = require('../middleware/authverify')

router.get('/home',authController.home);
router.post('/login',authverify,authController.login);
router.post('/refresh',authverify,authController.refresh);



module.exports = router;