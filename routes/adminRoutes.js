const express = require('express');
const router = express.Router();
const {adminController} = require('../controller');
const authverify = require('../middleware/authverify')

router.get('/items',authverify.adminauth,adminController.itemlist);
router.get('/users',authverify.adminauth,adminController.seeAllUsers);
router.get('/highestdonor',authverify.adminauth,adminController.highestDonor);
router.get('/items/collected',authverify.adminauth,adminController.allCollectedItems);
router.post('/togglecollector',authverify.adminauth,adminController.toggleCollector);
router.patch('/status/:itemId',authverify.adminauth,adminController.changeStatus);
router.patch('/donate/:itemId',authverify.adminauth,adminController.donateItem);
router.post('/refresh',adminController.refreshToken);
router.post('/login',adminController.login);
// router.post('/create',adminController.create);


module.exports = router;