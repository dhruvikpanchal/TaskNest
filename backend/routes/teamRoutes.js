const express = require('express');
const router = express.Router();
const {
    createTeam,
    getTeams,
    getMyTeam,
    updateTeam,
    deleteTeam
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
    .route('/')
    .post(protect, authorize('Admin'), createTeam)
    .get(protect, authorize('Admin', 'Team Lead'), getTeams);

router
    .route('/:id')
    .put(protect, authorize('Admin'), updateTeam)
    .delete(protect, authorize('Admin'), deleteTeam);

router.get('/my', protect, getMyTeam);

module.exports = router;
