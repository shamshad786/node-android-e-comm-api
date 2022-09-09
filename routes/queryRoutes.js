const express = require('express');
const router = express.Router();

const queryController = require('../controller/queryController');


router.post('/', queryController.createQuery);
router.get('/', queryController.getAllQueries);
router.get('/:id',queryController.singleQuery);

router.delete('/:id', queryController.deleteQuery);

router.delete('/', queryController.deleteAllQuery);

module.exports = router;