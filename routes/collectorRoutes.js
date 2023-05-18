const express = require('express');
const router = express.Router();
const collectorController = require('../controller/collectorController');
const authverify = require('../middleware/authverify')

router.get('/approveditems',authverify.auth,collectorController.getApprovedItemsList);


module.exports = router;