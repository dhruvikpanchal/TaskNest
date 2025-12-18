import { Link, useLocation } from 'react-router-dom';
import { FaTasks, FaUsers, FaChartPie, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
            <div className="p-6 border-b border-gray-200 flex items-center justify-center">
                <h1 className="text-2xl font-bold text-primary">TaskNest</h1>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-2">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FaChartPie /> Dashboard
                    </Link>

                    <Link
                        to="/tasks"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/tasks')
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FaTasks /> Tasks
                    </Link>

                    <Link
                        to="/teams"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/teams')
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <FaUsers /> Teams
                    </Link>

                    {user?.role === 'Admin' && (
                        <Link
                            to="/users"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/users')
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <FaUserShield /> Users
                        </Link>
                    )}

                </nav>
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
