const express = require('express');
const c = require('../controllers/studentController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/').get(c.getStudents).post(c.createStudent);
router.get('/search/:name', c.searchStudents); // must stay above '/:id'
router.route('/:id').all(validateObjectId).get(c.getStudentById).put(c.updateStudent).delete(c.deleteStudent);

module.exports = router;
