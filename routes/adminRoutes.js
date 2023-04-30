const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authverify = require('../middleware/authverify')

router.get('/items',authverify.adminauth,adminController.itemlist);
router.patch('/status/:itemId',authverify.adminauth,adminController.changeStatus);
router.post('/refresh',adminController.refreshToken);
router.post('/login',adminController.login);
// router.post('/create',adminController.create);


module.exports = router;