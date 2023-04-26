const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const authverify = require('../middleware/authverify')

router.post('\login',adminController.login);

module.exports = router;