const express = require('express');
const router = express.Router();
const {homeController} = require('../controller');
const authverify = require('../middleware/authverify')

router.post('/create',authverify.auth,homeController.createItem);
router.get('/collected',authverify.auth,homeController.getCollectedItems);
router.get('/myitems',authverify.auth,homeController.getMyItems);

module.exports = router;