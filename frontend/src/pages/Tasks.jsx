import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaFilter } from 'react-icons/fa';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
        assignedTo: '',
        teamId: ''
    });

    const [teams, setTeams] = useState([]); // For Admin
    const [teamMembers, setTeamMembers] = useState([]); // For dropdown

    useEffect(() => {
        fetchTasks();
        if (user.role === 'Admin') {
            fetchTeams();
        } else if (user.teamId) {
            // If normal user/lead, set their teamId by default
            setNewTask(prev => ({ ...prev, teamId: user.teamId, assignedTo: user._id }));
            fetchTeamMembers(user.teamId);
        }
    }, [user.role, user.teamId]);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            const { data } = await api.get('/teams');
            setTeams(data);
        } catch (error) {
            console.error(error);
        }
    }

    const fetchTeamMembers = async (teamId) => {
        try {
            // We can't easily get members of a specific team without an endpoint or using the teams list.
            // If we have teams list (Admin), use that.
            if (teams.length > 0) {
                const team = teams.find(t => t._id === teamId);
                if (team) setTeamMembers(team.members);
            } else {
                // For non-admin, /teams/my returns the team with members
                const { data } = await api.get('/teams/my');
                setTeamMembers(data.members || []);
            }
        } catch (error) {
            console.log("No team found or error fetching members");
        }
    }

    // When Admin selects a team in modal
    const handleTeamChange = (e) => {
        const tId = e.target.value;
        setNewTask({ ...newTask, teamId: tId, assignedTo: '' });

        const team = teams.find(t => t._id === tId);
        if (team) {
            setTeamMembers(team.members);
        } else {
            setTeamMembers([]);
        }
    }

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newTask };
            if (!payload.assignedTo && user.role === 'Team Member') payload.assignedTo = user._id;

            const { data } = await api.post('/tasks', payload);
            setTasks([...tasks, data]);
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            alert('Error creating task: ' + (error.response?.data?.message || 'Missing Fields'));
        }
    };

    const resetForm = () => {
        setNewTask({
            title: '',
            description: '',
            priority: 'Medium',
            status: 'To Do',
            dueDate: '',
            assignedTo: user.role === 'Admin' ? '' : user._id,
            teamId: user.role === 'Admin' ? '' : user.teamId
        });
        if (user.role !== 'Admin' && user.teamId) {
            fetchTeamMembers(user.teamId);
        } else {
            setTeamMembers([]);
        }
    }

    const updateStatus = async (taskId, newStatus) => {
        try {
            const { data } = await api.put(`/tasks/${taskId}`, { status: newStatus });
            setTasks(tasks.map(t => t._id === taskId ? data : t));
        } catch (error) {
            console.error(error);
        }
    }

    const columns = ['To Do', 'In Progress', 'Review', 'Completed'];

    if (loading) return <div>Loading...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
                    <p className="text-sm text-gray-500">
                        {user.role === 'Admin' ? 'All Tasks' : (user.teamId ? 'Team Tasks' : 'My Tasks')}
                    </p>
                </div>
                {(user.role === 'Admin' || user.role === 'Team Lead') && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <FaPlus /> New Task
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-6 min-w-max pb-4">
                    {columns.map((column) => (
                        <div key={column} className="w-80 bg-gray-100 rounded-xl p-4 flex flex-col">
                            <h2 className="font-semibold text-gray-700 mb-4 flex justify-between items-center">
                                {column}
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                                    {tasks.filter(t => t.status === column).length}
                                </span>
                            </h2>
                            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                {tasks.filter(t => t.status === column).map(task => (
                                    <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            {(user.role !== 'Team Member' || task.assignedTo?._id === user._id) && (
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => updateStatus(task._id, e.target.value)}
                                                    className="text-xs border-none bg-transparent focus:ring-0 text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                                        <div className="flex justify-between items-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                            {task.assignedTo && (
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px]">{task.assignedTo.name}</span>
                                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px]" title={task.assignedTo.name}>
                                                        {task.assignedTo.name?.charAt(0)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Task</h2>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                required
                                className="w-full border rounded-lg px-3 py-2"
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Description"
                                required
                                className="w-full border rounded-lg px-3 py-2"
                                value={newTask.description}
                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                            />

                            {user.role === 'Admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Team</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newTask.teamId}
                                        onChange={handleTeamChange}
                                        required
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map(t => (
                                            <option key={t._id} value={t._id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {(user.role === 'Admin' ? teamMembers.length > 0 : true) && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                                    <select
                                        className="w-full border rounded-lg px-3 py-2"
                                        value={newTask.assignedTo}
                                        onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Member</option>
                                        {teamMembers.map(m => (
                                            <option key={m._id} value={m._id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
