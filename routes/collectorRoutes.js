const express = require('express');
const router = express.Router();
const collectorController = require('../controller/collectorController');
const authverify = require('../middleware/authverify')

router.get('/approveditems',authverify.auth,collectorController.getApprovedItemsList);
router.patch('/changeCollected/:itemId',authverify.auth,collectorController.changeStatusToCollected);

module.exports = router;