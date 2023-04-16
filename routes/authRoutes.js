const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const authverify = require('../middleware/authverify')

router.get('/home',authController.home);
router.get('/user',authverify.auth,authController.getUser);
router.post('/login',authController.login);
router.post('/refresh',authController.refreshToken);
router.post('/email',authController.email);
router.post('/email/verify',authController.everify);
router.post('/signup',authverify.auth2,authController.signup);

module.exports = router;