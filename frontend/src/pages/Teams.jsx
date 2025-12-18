import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaPlus, FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';

const Teams = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null); // If null, we are creating

    const [teamName, setTeamName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        if (user.role === 'Admin') {
            fetchTeams();
            fetchUsers();
        } else {
            fetchMyTeam();
        }
    }, [user.role]);

    const fetchTeams = async () => {
        try {
            const { data } = await api.get('/teams');
            setTeams(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setAllUsers(data);
        } catch (error) {
            console.error("Failed to fetch users");
        }
    }

    const fetchMyTeam = async () => {
        try {
            const { data } = await api.get('/teams/my');
            setMyTeam(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingTeam(null);
        setTeamName('');
        setSelectedMembers([]);
        setIsModalOpen(true);
    }

    const openEditModal = (team) => {
        setEditingTeam(team);
        setTeamName(team.name);
        // Map member objects to IDs
        setSelectedMembers(team.members.map(m => m._id));
        setIsModalOpen(true);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTeam) {
                // Update
                const { data } = await api.put(`/teams/${editingTeam._id}`, {
                    name: teamName,
                    members: selectedMembers
                });
                setTeams(teams.map(t => t._id === editingTeam._id ? data : t));
            } else {
                // Create
                const { data } = await api.post('/teams', {
                    name: teamName,
                    members: selectedMembers
                });
                setTeams([...teams, data]);
            }

            setIsModalOpen(false);
            setEditingTeam(null);
            setTeamName('');
            setSelectedMembers([]);
            fetchUsers(); // Refresh users list
        } catch (error) {
            alert('Error saving team: ' + (error.response?.data?.message || error.message));
        }
    }

    const handleDelete = async (teamId) => {
        if (window.confirm('Are you sure you want to delete this team? Members will be unassigned.')) {
            try {
                await api.delete(`/teams/${teamId}`);
                setTeams(teams.filter(t => t._id !== teamId));
                fetchUsers();
            } catch (error) {
                alert('Error deleting team');
            }
        }
    }

    const toggleMemberSelection = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    }

    if (loading) return <div>Loading...</div>;

    // Admin View
    if (user.role === 'Admin') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">All Teams</h1>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <FaPlus /> Create Team
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.length === 0 && <p className="text-gray-500 col-span-3">No teams created yet.</p>}
                    {teams.map(team => (
                        <div key={team._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <FaUsers />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{team.name}</h3>
                                        <p className="text-xs text-gray-500">
                                            Created by {team.createdBy?.name || 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(team)} className="text-gray-400 hover:text-indigo-600 p-1">
                                        <FaEdit />
                                    </button>
                                    <button onClick={() => handleDelete(team._id)} className="text-gray-400 hover:text-red-600 p-1">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{team.members.length} members</p>
                            <div className="flex -space-x-2 overflow-hidden mb-4 h-8">
                                {team.members.slice(0, 5).map(m => (
                                    <div key={m._id} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold" title={m.name}>
                                        {m.name.charAt(0)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-lg w-full p-6 flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">{editingTeam ? 'Edit Team' : 'Create New Team'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Engineering"
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Members ({selectedMembers.length})</label>
                                    <p className="text-xs text-gray-500 mb-2">Users without a team are highlighted.</p>
                                </div>

                                <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-2 mb-4">
                                    {allUsers.map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => toggleMemberSelection(u._id)}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors ${selectedMembers.includes(u._id)
                                                    ? 'bg-indigo-50 border-indigo-200'
                                                    : 'hover:bg-gray-50 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${u.teamId ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                                    <p className="text-xs text-gray-500">{u.email}</p>
                                                </div>
                                            </div>
                                            {selectedMembers.includes(u._id) && <FaCheck className="text-primary" />}
                                            {u.teamId && !selectedMembers.includes(u._id) && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                    {u.teamId.name || 'Other Team'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700">
                                        {editingTeam ? 'Update Team' : 'Create Team'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Member/Lead View (unchanged)
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">My Team</h1>
            {myTeam ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-3xl">
                    <div className="flex justify-between items-start mb-6 border-b pb-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                                <FaUsers className="text-indigo-600" /> {myTeam.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Managed by {myTeam.createdBy?.name || 'Admin'}</p>
                        </div>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {myTeam.members.length} Members
                        </span>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Team Roster</h3>
                        {myTeam.members.map(member => (
                            <div key={member._id} className="flex items-center justify-between py-2 group hover:bg-gray-50 rounded-lg px-2 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${member.role === 'Team Lead'
                                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                                    }`}>
                                    {member.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    <FaUsers className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No Team Assigned</p>
                    <p className="text-sm">You are not part of any team yet. Contact your administrator.</p>
                </div>
            )}
        </div>
    );
};

export default Teams;
