const express = require('express');
const router = express.Router();
const {authController} = require('../controller');
const authverify = require('../middleware/authverify')

router.get('/home',authController.home);
router.get('/user',authverify.auth,authController.getUser);
router.post('/login',authController.login);
router.post('/refresh',authController.refreshToken);
router.post('/email',authController.email);
router.post('/forgot',authController.forgotEmail);
router.post('/email/verify',authController.everify);
router.post('/forgot/verify',authController.forgotVerify);
router.post('/signup',authverify.auth2,authController.signup);
router.post('/password',authverify.auth2,authController.ChangePassword);

module.exports = router;