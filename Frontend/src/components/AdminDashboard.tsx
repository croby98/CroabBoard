import React, { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    btn_size: number;
    button_count: number;
}

interface DeletedButton {
    id: number;
    delete_date: string;
    button_name: string;
    status: string;
    sound_filename?: string;
    image_filename?: string;
    owner_id: number;
}

interface SystemStats {
    total_users: number;
    total_buttons: number;
    total_deleted: number;
    total_categories: number;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [deletedHistory, setDeletedHistory] = useState<DeletedButton[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'deleted'>('overview');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Note: These endpoints would need to be implemented in the backend
            // For now, we'll show the structure with mock data
            
            // Mock data - replace with actual API calls
            setStats({
                total_users: 25,
                total_buttons: 150,
                total_deleted: 12,
                total_categories: 8
            });

            setUsers([
                { id: 1, username: 'user1', btn_size: 150, button_count: 15 },
                { id: 2, username: 'user2', btn_size: 200, button_count: 8 },
            ]);

            // Fetch actual deleted history
            const deletedResponse = await fetch('http://localhost:5000/api/deleted_history', {
                method: 'GET',
                credentials: 'include',
            });

            if (deletedResponse.ok) {
                const deletedData = await deletedResponse.json();
                if (deletedData.success) {
                    setDeletedHistory(deletedData.history || []);
                }
            }

        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreButton = async (historyId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/restore_from_history/${historyId}`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage('Button restored successfully');
                fetchDashboardData(); // Refresh data
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to restore button');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to restore button');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-white">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded text-red-100">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-900 border border-green-700 rounded text-green-100">
                        {successMessage}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-8">
                    {[
                        { key: 'overview', label: 'Overview' },
                        { key: 'users', label: 'Users' },
                        { key: 'deleted', label: 'Deleted Items' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Users</h3>
                            <p className="text-3xl font-bold text-blue-400">{stats.total_users}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Buttons</h3>
                            <p className="text-3xl font-bold text-green-400">{stats.total_buttons}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">Deleted Items</h3>
                            <p className="text-3xl font-bold text-red-400">{stats.total_deleted}</p>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-300 mb-2">Categories</h3>
                            <p className="text-3xl font-bold text-purple-400">{stats.total_categories}</p>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">User Management</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="pb-3 text-gray-300">ID</th>
                                        <th className="pb-3 text-gray-300">Username</th>
                                        <th className="pb-3 text-gray-300">Button Size</th>
                                        <th className="pb-3 text-gray-300">Button Count</th>
                                        <th className="pb-3 text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-700">
                                            <td className="py-3">{user.id}</td>
                                            <td className="py-3">{user.username}</td>
                                            <td className="py-3">{user.btn_size}px</td>
                                            <td className="py-3">{user.button_count}</td>
                                            <td className="py-3">
                                                <button className="text-blue-400 hover:text-blue-300 mr-3">
                                                    View
                                                </button>
                                                <button className="text-red-400 hover:text-red-300">
                                                    Suspend
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Deleted Items Tab */}
                {activeTab === 'deleted' && (
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Deleted Items History</h2>
                        <div className="space-y-4">
                            {deletedHistory.length > 0 ? (
                                deletedHistory.map((item, index) => (
                                    <div key={index} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{item.button_name}</h3>
                                            <p className="text-sm text-gray-400">
                                                Deleted: {new Date(item.delete_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                Status: <span className={`font-medium ${
                                                    item.status === 'restored' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </p>
                                            {item.image_filename && (
                                                <p className="text-xs text-gray-500">Image: {item.image_filename}</p>
                                            )}
                                            {item.sound_filename && (
                                                <p className="text-xs text-gray-500">Sound: {item.sound_filename}</p>
                                            )}
                                        </div>
                                        {item.status === 'deleted' && (
                                            <button
                                                onClick={() => handleRestoreButton(index + 1)} // Note: This needs proper ID handling
                                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                                            >
                                                Restore
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-center py-8">No deleted items found.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;