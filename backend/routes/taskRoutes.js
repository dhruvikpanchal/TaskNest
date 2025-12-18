const express = require('express');
const router = express.Router();
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
    .route('/')
    .get(protect, getTasks)
    .post(protect, authorize('Admin', 'Team Lead'), createTask);

router
    .route('/:id')
    .put(protect, updateTask)
    .delete(protect, authorize('Admin', 'Team Lead'), deleteTask);

module.exports = router;
