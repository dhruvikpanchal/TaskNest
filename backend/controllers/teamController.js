const asyncHandler = require('express-async-handler');
const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Admin)
const createTeam = asyncHandler(async (req, res) => {
    const { name, members } = req.body;

    const teamExists = await Team.findOne({ name });

    if (teamExists) {
        res.status(400);
        throw new Error('Team already exists');
    }

    const team = await Team.create({
        name,
        members,
        createdBy: req.user._id,
    });

    // Update members' teamId
    if (members && members.length > 0) {
        await User.updateMany(
            { _id: { $in: members } },
            { $set: { teamId: team._id } }
        );
    }

    // Populate for return
    const populatedTeam = await Team.findById(team._id).populate('members', 'name email role').populate('createdBy', 'name');
    res.status(201).json(populatedTeam);
});

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private (Admin, Team Lead)
const getTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({}).populate('members', 'name email role').populate('createdBy', 'name');
    res.json(teams);
});

// @desc    Get my team
// @route   GET /api/teams/my
// @access  Private
const getMyTeam = asyncHandler(async (req, res) => {
    if (!req.user.teamId) {
        res.status(404);
        throw new Error('You are not assigned to any team');
    }
    const team = await Team.findById(req.user.teamId).populate('members', 'name email role').populate('createdBy', 'name');
    if (team) {
        res.json(team);
    } else {
        res.status(404);
        throw new Error('Team not found');
    }
});

// @desc    Update team (add/remove members or change name)
// @route   PUT /api/teams/:id
// @access  Private (Admin)
const updateTeam = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    const { name, members } = req.body;

    // Identify members to be removed (in team.members but not in req.body.members)
    const currentMemberIds = team.members.map(m => m.toString());
    const newMemberIds = members || [];

    const membersToRemove = currentMemberIds.filter(id => !newMemberIds.includes(id));
    const membersToAdd = newMemberIds.filter(id => !currentMemberIds.includes(id));

    // Unset teamId for removed members
    if (membersToRemove.length > 0) {
        await User.updateMany(
            { _id: { $in: membersToRemove } },
            { $set: { teamId: null } }
        );
    }

    // Set teamId for added members
    if (membersToAdd.length > 0) {
        await User.updateMany(
            { _id: { $in: membersToAdd } },
            { $set: { teamId: team._id } }
        );
    }

    team.name = name || team.name;
    team.members = members; // Update the list

    await team.save();

    const updatedTeam = await Team.findById(team._id).populate('members', 'name email role').populate('createdBy', 'name');
    res.json(updatedTeam);
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
const deleteTeam = asyncHandler(async (req, res) => {
    const team = await Team.findById(req.params.id);

    if (!team) {
        res.status(404);
        throw new Error('Team not found');
    }

    // Unset teamId for all members
    if (team.members && team.members.length > 0) {
        await User.updateMany(
            { _id: { $in: team.members } },
            { $set: { teamId: null } }
        );
    }

    await team.deleteOne();

    res.json({ message: 'Team removed' });
});

module.exports = {
    createTeam,
    getTeams,
    getMyTeam,
    updateTeam,
    deleteTeam
};
