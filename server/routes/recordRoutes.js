const express = require('express');
const c = require('../controllers/recordController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/').get(c.getRecords).post(c.createRecord);
router.post('/reset-samples', c.resetSamples); // must stay above '/:id'
router.route('/:id').all(validateObjectId).get(c.getRecordById).put(c.updateRecord).delete(c.deleteRecord);

module.exports = router;
