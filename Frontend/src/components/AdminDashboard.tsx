import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface User {
    id: number;
    username: string;
    btn_size: number;
    button_count: number;
    is_admin: boolean;
    avatar: string | null;
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

interface Category {
    id: number;
    name: string;
    color: string;
    button_count?: number;
}

interface AdminButton {
    id: number;
    button_name: string;
    image_filename: string;
    sound_filename?: string;
    imageUrl?: string;
    soundUrl?: string;
    category_name?: string;
    category_color?: string;
    uploaded_by_username?: string;
    upload_date?: string;
    category_id?: number;
}

interface SystemStats {
    total_users: number;
    total_buttons: number;
    total_deleted: number;
    total_categories: number;
    total_plays: number;
    active_users_today: number;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [deletedButtons, setDeletedButtons] = useState<DeletedButton[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'buttons' | 'categories' | 'deleted' | 'audit'>('overview');
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [allButtons, setAllButtons] = useState<AdminButton[]>([]);

    // Modal states
    const [itemToRestore, setItemToRestore] = useState<DeletedButton | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');
    const [buttonToEdit, setButtonToEdit] = useState<AdminButton | null>(null);
    const [editButtonName, setEditButtonName] = useState('');
    const [editButtonCategory, setEditButtonCategory] = useState('');

    const { isAdmin, isSuperAdmin, isLightAdmin } = useAuth();

    // Access control - only allow admin users
    if (!isAdmin) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base-200">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body text-center">
                        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                        <p className="opacity-70">You do not have permission to access the admin dashboard.</p>
                        <div className="card-actions justify-center mt-4">
                            <a href="/home" className="btn btn-primary">Go to Home</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch users
            const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
                credentials: 'include',
            });
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData.users || []);
            }

            // Fetch stats
            const statsResponse = await fetch('http://localhost:5000/api/stats/all', {
                credentials: 'include',
            });
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                if (statsData.success) {
                    setStats(statsData.stats);
                }
            }

            // Fetch deleted buttons
            const deletedResponse = await fetch('http://localhost:5000/api/admin/deleted-buttons', {
                credentials: 'include',
            });
            if (deletedResponse.ok) {
                const deletedData = await deletedResponse.json();
                if (deletedData.success) {
                    setDeletedButtons(deletedData.buttons || []);
                }
            }

            // Fetch categories
            const categoriesResponse = await fetch('http://localhost:5000/api/categories', {
                credentials: 'include',
            });
            if (categoriesResponse.ok) {
                const catData = await categoriesResponse.json();
                if (catData.success) {
                    setCategories(catData.categories || []);
                }
            }

            // Fetch all buttons
            console.log('Fetching buttons as admin user:', user);
            console.log('User is admin check:', user?.isAdmin);
            try {
                const buttonsResponse = await fetch('http://localhost:5000/api/admin/buttons', {
                    credentials: 'include',
                });
                console.log('Buttons response status:', buttonsResponse.status);
                console.log('Buttons response headers:', Object.fromEntries(buttonsResponse.headers.entries()));

                if (buttonsResponse.ok) {
                    const buttonsData = await buttonsResponse.json();
                    console.log('Buttons data received:', buttonsData);
                    console.log('Buttons success flag:', buttonsData.success);
                    console.log('Buttons array length:', buttonsData.buttons?.length);
                    console.log('First button (if any):', buttonsData.buttons?.[0]);

                    if (buttonsData.success) {
                        console.log('Setting buttons count:', buttonsData.buttons?.length || 0);
                        setAllButtons(buttonsData.buttons || []);
                    } else {
                        console.error('Buttons API returned error:', buttonsData);
                        setErrorMessage(`Failed to load buttons: ${buttonsData.error || 'Unknown error'}`);
                    }
                } else {
                    const errorText = await buttonsResponse.text();
                    console.error('Buttons response not ok:', buttonsResponse.status, buttonsResponse.statusText, errorText);
                    setErrorMessage(`Failed to load buttons: ${buttonsResponse.status} ${buttonsResponse.statusText}`);
                }
            } catch (error) {
                console.error('Buttons fetch error:', error);
                setErrorMessage(`Network error loading buttons: ${error.message}`);
            }

            // Fetch audit logs (only for super admin)
            if (user?.isAdmin === 2) {
                const auditResponse = await fetch('http://localhost:5000/api/admin/audit-logs?limit=50', {
                    credentials: 'include',
                });
                if (auditResponse.ok) {
                    const auditData = await auditResponse.json();
                    if (auditData.success) {
                        setAuditLogs(auditData.logs || []);
                    }
                }
            }

        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleRestoreButton = async () => {
        if (!itemToRestore) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/deleted-buttons/${itemToRestore.id}/restore`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage(`Button "${itemToRestore.button_name}" restored successfully`);
                fetchDashboardData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to restore button');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to restore button');
        } finally {
            setItemToRestore(null);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage(`User "${userToDelete.username}" deleted successfully`);
                fetchDashboardData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to delete user');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete user');
        } finally {
            setUserToDelete(null);
        }
    };

    const handleToggleAdmin = async (userId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-admin`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage(data.message);
                fetchDashboardData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to update admin status');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update admin status');
        }
    };

    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) {
            setErrorMessage('Category name is required');
            return;
        }

        try {
            const url = categoryToEdit
                ? `http://localhost:5000/api/categories/${categoryToEdit.id}`
                : 'http://localhost:5000/api/categories';

            const response = await fetch(url, {
                method: categoryToEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: newCategoryName,
                    color: newCategoryColor,
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage(categoryToEdit ? 'Category updated successfully' : 'Category created successfully');
                fetchDashboardData();
                setTimeout(() => setSuccessMessage(''), 3000);
                (document.getElementById('category_modal') as HTMLDialogElement)?.close();
                setCategoryToEdit(null);
                setNewCategoryName('');
                setNewCategoryColor('#3b82f6');
            } else {
                setErrorMessage(data.message || 'Failed to save category');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to save category');
        }
    };

    const handleDeleteCategory = async (categoryId: number) => {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage('Category deleted successfully');
                fetchDashboardData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to delete category');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete category');
        }
    };

    const handleEditButton = (button: any) => {
        setButtonToEdit(button);
        setEditButtonName(button.button_name);
        setEditButtonCategory(button.category_id || '');
        (document.getElementById('button_edit_modal') as HTMLDialogElement)?.showModal();
    };

    const handleSaveButton = async () => {
        if (!editButtonName.trim()) {
            setErrorMessage('Button name is required');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/buttons/${buttonToEdit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    button_name: editButtonName,
                    category_id: editButtonCategory || null,
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage('Button updated successfully');
                fetchDashboardData();
                setTimeout(() => setSuccessMessage(''), 3000);
                (document.getElementById('button_edit_modal') as HTMLDialogElement)?.close();
                setButtonToEdit(null);
                setEditButtonName('');
                setEditButtonCategory('');
            } else {
                setErrorMessage(data.message || 'Failed to update button');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update button');
        }
    };

    const handleDeleteButton = async (buttonId: number) => {
        if (!confirm('Are you sure you want to delete this button? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/admin/buttons/${buttonId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage('Button deleted successfully');
                fetchDashboardData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to delete button');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete button');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                    <div className="badge badge-primary badge-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin Access
                    </div>
                </div>

                {errorMessage && (
                    <div className="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-8">
                    <a
                        className={`tab tab-lg ${activeTab === 'overview' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Overview
                    </a>
                    {isSuperAdmin && (
                        <a
                            className={`tab tab-lg ${activeTab === 'users' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Users
                        </a>
                    )}
                    <a
                        className={`tab tab-lg ${activeTab === 'buttons' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('buttons')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        Buttons
                    </a>
                    <a
                        className={`tab tab-lg ${activeTab === 'categories' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Categories
                    </a>
                    <a
                        className={`tab tab-lg ${activeTab === 'deleted' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('deleted')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Deleted Items
                        {deletedButtons.filter(d => d.status === 'deleted').length > 0 && (
                            <span className="badge badge-error badge-sm ml-2">
                                {deletedButtons.filter(d => d.status === 'deleted').length}
                            </span>
                        )}
                    </a>
                    {isSuperAdmin && (
                        <a
                            className={`tab tab-lg ${activeTab === 'audit' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('audit')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Audit Logs
                        </a>
                    )}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="stat bg-base-100 rounded-lg shadow-lg">
                            <div className="stat-figure text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="stat-title">Total Users</div>
                            <div className="stat-value text-primary">{stats.total_users}</div>
                            <div className="stat-desc">Registered accounts</div>
                        </div>

                        <div className="stat bg-base-100 rounded-lg shadow-lg">
                            <div className="stat-figure text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            <div className="stat-title">Total Buttons</div>
                            <div className="stat-value text-secondary">{stats.total_buttons}</div>
                            <div className="stat-desc">Uploaded sounds</div>
                        </div>

                        <div className="stat bg-base-100 rounded-lg shadow-lg">
                            <div className="stat-figure text-accent">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="stat-title">Total Plays</div>
                            <div className="stat-value text-accent">{stats.total_plays || 0}</div>
                            <div className="stat-desc">Sound plays</div>
                        </div>

                        <div className="stat bg-base-100 rounded-lg shadow-lg">
                            <div className="stat-figure text-error">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <div className="stat-title">Deleted Items</div>
                            <div className="stat-value text-error">{stats.total_deleted}</div>
                            <div className="stat-desc">In recycle bin</div>
                        </div>

                        <div className="stat bg-base-100 rounded-lg shadow-lg">
                            <div className="stat-figure text-info">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                            <div className="stat-title">Categories</div>
                            <div className="stat-value text-info">{stats.total_categories}</div>
                            <div className="stat-desc">Organization tags</div>
                        </div>

                        <div className="stat bg-base-100 rounded-lg shadow-lg">
                            <div className="stat-figure text-success">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div className="stat-title">Active Today</div>
                            <div className="stat-value text-success">{stats.active_users_today || 0}</div>
                            <div className="stat-desc">Users online today</div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">User Management</h2>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Button Size</th>
                                            <th>Buttons</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.id}</td>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar">
                                                            <div className="w-10 rounded-full ring-2 ring-base-300">
                                                                {u.avatar ? (
                                                                    <img src={`http://localhost:5000/uploads/avatars/${u.avatar}`} alt={u.username} />
                                                                ) : (
                                                                    <div className="bg-neutral text-neutral-content flex items-center justify-center w-full h-full">
                                                                        <span className="text-sm">{u.username[0].toUpperCase()}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">{u.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {u.is_admin ? (
                                                        <span className="badge badge-primary">Admin</span>
                                                    ) : (
                                                        <span className="badge badge-ghost">User</span>
                                                    )}
                                                </td>
                                                <td>{u.btn_size}px</td>
                                                <td>
                                                    <span className="badge badge-ghost">{u.button_count}</span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <button
                                                            className={`btn btn-sm ${u.is_admin ? 'btn-warning' : 'btn-info'}`}
                                                            onClick={() => handleToggleAdmin(u.id)}
                                                            disabled={u.id === user?.id}
                                                            title={u.id === user?.id ? "Can't modify your own admin status" : "Toggle admin status"}
                                                        >
                                                            {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                                        </button>
                                                        <button
                                                            className="btn btn-error btn-sm"
                                                            onClick={() => setUserToDelete(u)}
                                                            disabled={u.id === user?.id}
                                                            title={u.id === user?.id ? "Can't delete yourself" : "Delete user"}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="grid gap-6">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex justify-between items-center">
                                    <h2 className="card-title">Category Management</h2>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setCategoryToEdit(null);
                                            setNewCategoryName('');
                                            setNewCategoryColor('#3b82f6');
                                            (document.getElementById('category_modal') as HTMLDialogElement)?.showModal();
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        New Category
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="card bg-base-200">
                                            <div className="card-body">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-lg"
                                                        style={{ backgroundColor: cat.color }}
                                                    ></div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold">{cat.name}</h3>
                                                        <p className="text-sm opacity-60">
                                                            {cat.button_count || 0} buttons
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="card-actions justify-end mt-2">
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => {
                                                            setCategoryToEdit(cat);
                                                            setNewCategoryName(cat.name);
                                                            setNewCategoryColor(cat.color);
                                                            (document.getElementById('category_modal') as HTMLDialogElement)?.showModal();
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    {isSuperAdmin && (
                                                        <button
                                                            className="btn btn-sm btn-error"
                                                            onClick={() => handleDeleteCategory(cat.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Deleted Items Tab */}
                {activeTab === 'deleted' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Deleted Items - Restore Center</h2>
                            <div className="space-y-3 mt-4">
                                {deletedButtons.length > 0 ? (
                                    deletedButtons.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`card bg-base-200 ${
                                                item.status === 'restored' ? 'opacity-50' : ''
                                            }`}
                                        >
                                            <div className="card-body p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg">{item.button_name}</h3>
                                                        <div className="text-sm opacity-60 mt-1">
                                                            <p>Deleted: {new Date(item.delete_date).toLocaleString()}</p>
                                                            {item.image_filename && (
                                                                <p>Image: {item.image_filename}</p>
                                                            )}
                                                            {item.sound_filename && (
                                                                <p>Sound: {item.sound_filename}</p>
                                                            )}
                                                        </div>
                                                        <div className="mt-2">
                                                            <span
                                                                className={`badge ${
                                                                    item.status === 'restored'
                                                                        ? 'badge-success'
                                                                        : 'badge-error'
                                                                }`}
                                                            >
                                                                {item.status.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {item.status === 'deleted' && (
                                                        <button
                                                            onClick={() => setItemToRestore(item)}
                                                            className="btn btn-success"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            Restore
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <p className="opacity-60 text-lg">No deleted items found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Audit Logs Tab */}
                {activeTab === 'audit' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Audit Logs</h2>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra table-sm">
                                    <thead>
                                        <tr>
                                            <th>Timestamp</th>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>IP Address</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.length > 0 ? (
                                            auditLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="whitespace-nowrap">
                                                        {new Date(log.created_at).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <span className="font-medium">
                                                            {log.username || 'anonymous'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge badge-sm ${
                                                                log.action.includes('failed')
                                                                    ? 'badge-error'
                                                                    : log.action.includes('success') || log.action.includes('login')
                                                                    ? 'badge-success'
                                                                    : log.action.includes('delete')
                                                                    ? 'badge-warning'
                                                                    : 'badge-info'
                                                            }`}
                                                        >
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="font-mono text-xs">
                                                        {log.ip_address || 'N/A'}
                                                    </td>
                                                    <td>
                                                        {log.details && (
                                                            <details className="collapse collapse-arrow bg-base-200 rounded-box">
                                                                <summary className="collapse-title text-xs py-1 min-h-0 cursor-pointer">
                                                                    View Details
                                                                </summary>
                                                                <div className="collapse-content">
                                                                    <pre className="text-xs overflow-x-auto">
                                                                        {JSON.stringify(JSON.parse(log.details || '{}'), null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </details>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 opacity-60">
                                                    No audit logs found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons Tab */}
                {activeTab === 'buttons' && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Button Management ({allButtons.length} buttons)</h2>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Button Name</th>
                                            <th>Category</th>
                                            <th>Uploaded By</th>
                                            <th>Upload Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="text-center">
                                                    <span className="loading loading-spinner loading-sm"></span> Loading buttons...
                                                </td>
                                            </tr>
                                        ) : allButtons.length > 0 ? (
                                            allButtons.map((button) => (
                                                <tr key={button.id}>
                                                    <td>
                                                        <div className="avatar">
                                                            <div className="w-12 h-12 rounded">
                                                                <img
                                                                    src={button.imageUrl ? `http://localhost:5000${button.imageUrl}` : `http://localhost:5000/uploads/images/${button.image_filename}`}
                                                                    alt={button.button_name}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="font-bold">{button.button_name}</div>
                                                    </td>
                                                    <td>
                                                        {button.category_name ? (
                                                            <span
                                                                className="badge badge-sm"
                                                                style={{
                                                                    backgroundColor: button.category_color,
                                                                    color: 'white'
                                                                }}
                                                            >
                                                                {button.category_name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-500">No category</span>
                                                        )}
                                                    </td>
                                                    <td>{button.uploaded_by_username}</td>
                                                    <td>{new Date(button.upload_date || button.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleEditButton(button)}
                                                            >
                                                                Edit
                                                            </button>
                                                            {isSuperAdmin && (
                                                                <button
                                                                    className="btn btn-sm btn-error"
                                                                    onClick={() => handleDeleteButton(button.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center text-gray-500">
                                                    No buttons found (Debug: allButtons.length = {allButtons.length})
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Restore Confirmation Modal */}
                {itemToRestore && (
                    <div className="modal modal-open" onClick={() => setItemToRestore(null)}>
                        <div className="modal-box relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setItemToRestore(null)}
                            >
                                ✕
                            </button>
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="font-bold text-xl text-center mb-2">Restore Button</h3>
                            <p className="text-center py-4">
                                Are you sure you want to restore<br />
                                <strong className="text-lg">{itemToRestore.button_name}</strong>?
                            </p>
                            <div className="modal-action justify-center gap-3">
                                <button className="btn btn-ghost" onClick={() => setItemToRestore(null)}>
                                    Cancel
                                </button>
                                <button className="btn btn-success" onClick={handleRestoreButton}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Restore
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete User Modal */}
                {userToDelete && (
                    <div className="modal modal-open" onClick={() => setUserToDelete(null)}>
                        <div className="modal-box relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setUserToDelete(null)}
                            >
                                ✕
                            </button>
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="font-bold text-xl text-center mb-2">Delete User</h3>
                            <p className="text-center py-4">
                                Are you sure you want to delete user<br />
                                <strong className="text-lg">{userToDelete.username}</strong>?<br />
                                <span className="text-warning font-semibold mt-2 block">⚠️ This action is irreversible</span>
                            </p>
                            <div className="modal-action justify-center gap-3">
                                <button className="btn btn-ghost" onClick={() => setUserToDelete(null)}>
                                    Cancel
                                </button>
                                <button className="btn btn-error" onClick={handleDeleteUser}>
                                    Delete User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Modal */}
                <dialog id="category_modal" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            {categoryToEdit ? 'Edit Category' : 'New Category'}
                        </h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Category Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="input input-bordered"
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Color</span>
                                </label>
                                <input
                                    type="color"
                                    value={newCategoryColor}
                                    onChange={(e) => setNewCategoryColor(e.target.value)}
                                    className="input input-bordered h-12"
                                />
                            </div>
                        </div>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => (document.getElementById('category_modal') as HTMLDialogElement)?.close()}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveCategory}>
                                Save
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>

                {/* Button Edit Modal */}
                <dialog id="button_edit_modal" className="modal">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Edit Button</h3>
                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Button Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={editButtonName}
                                    onChange={(e) => setEditButtonName(e.target.value)}
                                    className="input input-bordered"
                                    placeholder="Enter button name"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Category</span>
                                </label>
                                <select
                                    value={editButtonCategory}
                                    onChange={(e) => setEditButtonCategory(e.target.value)}
                                    className="select select-bordered"
                                >
                                    <option value="">No category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => (document.getElementById('button_edit_modal') as HTMLDialogElement)?.close()}
                            >
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleSaveButton}>
                                Save
                            </button>
                        </div>
                    </div>
                    <form method="dialog" className="modal-backdrop">
                        <button>close</button>
                    </form>
                </dialog>
            </div>
        </div>
    );
};

export default AdminDashboard;
