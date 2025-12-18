const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin, Team Lead)
const createTask = asyncHandler(async (req, res) => {
    const { title, description, assignedTo, priority, status, dueDate, teamId } = req.body;

    const task = await Task.create({
        title,
        description,
        assignedTo,
        priority,
        status,
        dueDate,
        teamId,
        createdBy: req.user._id,
    });

    res.status(201).json(task);
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
    let tasks;

    if (req.user.role === 'Admin') {
        // Admin sees all
        tasks = await Task.find({}).populate('assignedTo', 'name email').populate('createdBy', 'name');
    } else if (req.user.role === 'Team Lead') {
        // Team Lead sees tasks for their team (assuming user has teamId)
        if (req.user.teamId) {
            tasks = await Task.find({ teamId: req.user.teamId }).populate('assignedTo', 'name email').populate('createdBy', 'name');
        } else {
            tasks = []; // Or all tasks created by them?
        }
    } else {
        // Team Member sees tasks assigned to them
        tasks = await Task.find({ assignedTo: req.user._id }).populate('assignedTo', 'name email').populate('createdBy', 'name');
    }

    res.json(tasks);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Check permissions
    // Member can only update status
    if (req.user.role === 'Team Member') {
        if (task.assignedTo.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this task');
        }
        task.status = req.body.status || task.status;
    } else {
        // Admin / Lead can update everything
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.assignedTo = req.body.assignedTo || task.assignedTo;
        task.priority = req.body.priority || task.priority;
        task.status = req.body.status || task.status;
        task.dueDate = req.body.dueDate || task.dueDate;
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Team Lead)
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Assuming middleware handles role check, but double check ownership logic if needed
    await task.deleteOne();

    res.json({ message: 'Task removed' });
});

module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
};
