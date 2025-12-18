import { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        highPriority: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data } = await api.get('/tasks');
            const total = data.length;
            const completed = data.filter((t) => t.status === 'Completed').length;
            const pending = total - completed;
            const highPriority = data.filter((t) => t.priority === 'High').length;
            setStats({ total, completed, pending, highPriority });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.total}</dd>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="mt-1 text-3xl font-semibold text-secondary">{stats.completed}</dd>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="mt-1 text-3xl font-semibold text-orange-500">{stats.pending}</dd>
                </div>
                <div className="bg-white overflow-hidden shadow rounded-lg p-5">
                    <dt className="text-sm font-medium text-gray-500 truncate">High Priority</dt>
                    <dd className="mt-1 text-3xl font-semibold text-red-600">{stats.highPriority}</dd>
                </div>
            </div>

            {/* Could add a Recent Tasks list here */}
        </div>
    );
};

export default Dashboard;
