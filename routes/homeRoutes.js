const express = require('express');
const router = express.Router();
const {homeController} = require('../controller');
const authverify = require('../middleware/authverify')

router.post('/create',authverify.auth,homeController.createItem); 
router.patch('/updateuser',authverify.auth,homeController.updateUser); 
router.get('/collected',authverify.auth,homeController.getCollectedItems);
router.get('/myitems',authverify.auth,homeController.getMyItems);
router.get('/search',authverify.auth,homeController.searchItems);

module.exports = router;