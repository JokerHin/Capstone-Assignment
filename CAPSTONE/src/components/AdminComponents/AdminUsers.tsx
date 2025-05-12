import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../../context/AppContext";
import { Pencil, Trash, UserPlus, X, Check, Activity } from "lucide-react";
import questData from "../PlayerComponent/game-data/quest.json";

interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  createdAt: string;
}

interface PlayerProgress {
  _id: string;
  player_id: string;
  subquest_id: string;
  status: string;
}

interface SubquestInfo {
  title: string;
  quest_id: string | number;
  quest_title: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const appContext = useContext(AppContent);
  if (!appContext) {
    throw new Error("AppContent context is undefined");
  }

  const { backendUrl, userData, isLoggedin } = appContext;

  const [playerProgress, setPlayerProgress] = useState<
    Record<string, PlayerProgress[]>
  >({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [subquestInfoMap, setSubquestInfoMap] = useState<
    Record<string, SubquestInfo>
  >({});

  // Create a utility function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    const adminEmail =
      localStorage.getItem("adminEmail") ||
      userData?.email ||
      localStorage.getItem("userEmail");

    const headers: any = {};

    if (adminEmail) {
      headers["admin-email"] = adminEmail;
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  };

  // Fetch users on component mount and when page changes
  useEffect(() => {
    if (isLoggedin && userData?.userType === "admin") {
      fetchUsers(currentPage);
    } else {
      setLoading(false);
    }
  }, [currentPage, backendUrl, isLoggedin, userData]);

  const fetchUsers = async (page = currentPage) => {
    setLoading(true);
    try {
      if (!isLoggedin || userData?.userType !== "admin") {
        setUsers([]);
        setTotalPages(1);
        return;
      }

      // Make the request with admin headers
      const response = await axios.get(`${backendUrl}/api/admin/users`, {
        params: { page },
        withCredentials: true,
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        if (response.data.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          setTotalPages(response.data.pagination.totalPages || 1);
        } else {
          console.error(
            "API returned success but users data is invalid:",
            response.data
          );
          toast.error("Received invalid user data from server");
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch player progress data
  useEffect(() => {
    if (isLoggedin && userData?.userType === "admin" && users.length > 0) {
      fetchPlayerProgress();
      fetchSubquestInfo();
    }
  }, [users, backendUrl, isLoggedin, userData]);

  const fetchPlayerProgress = async () => {
    setProgressLoading(true);
    try {
      // Updated endpoint to match the server route
      const response = await axios.get(`${backendUrl}/player-progress`, {
        headers: getAuthHeaders(),
      });

      // Group progress by player_id
      const progressByPlayer: Record<string, PlayerProgress[]> = {};

      response.data.forEach((progress: PlayerProgress) => {
        if (!progressByPlayer[progress.player_id]) {
          progressByPlayer[progress.player_id] = [];
        }
        progressByPlayer[progress.player_id].push(progress);
      });

      setPlayerProgress(progressByPlayer);
    } catch (error) {
      console.error("Error fetching player progress:", error);
    } finally {
      setProgressLoading(false);
    }
  };

  // Fetch subquest information to display proper titles
  const fetchSubquestInfo = async () => {
    try {
      const response = await axios.get(`${backendUrl}/subquest`);
      const subquests = response.data;

      // Create a map of subquest_id to { title, quest_id, quest_title }
      const infoMap: Record<string, SubquestInfo> = {};

      subquests.forEach((subquest: any) => {
        // Find the associated quest title
        const quest = questData.find(
          (q: any) => String(q.quest_id) === String(subquest.quest_id)
        );

        infoMap[String(subquest.subquest_id)] = {
          title: subquest.title || `Subquest ${subquest.subquest_id}`,
          quest_id: subquest.quest_id,
          quest_title: quest ? quest.title : `Quest ${subquest.quest_id}`,
        };
      });

      setSubquestInfoMap(infoMap);
    } catch (error) {
      console.error("Error fetching subquest info:", error);
    }
  };

  // Get latest progress for a user
  const getLatestProgress = (userId: string) => {
    const userProgressList = playerProgress[userId] || [];
    if (userProgressList.length === 0) return null;

    // Return the latest progress entry (assuming the most recent is what we want)
    return userProgressList[userProgressList.length - 1];
  };

  // Update getProgressText to show only subquest ID
  const getProgressText = (progress: PlayerProgress | null) => {
    if (!progress) return "No progress data";

    // Find quest info if available
    const subquestInfo = subquestInfoMap[progress.subquest_id];
    const questTitle = subquestInfo ? subquestInfo.quest_title : "Quest";

    return `${questTitle} - Subquest: ${progress.subquest_id} (${
      progress.status || "In Progress"
    })`;
  };

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Function to open add user modal
  const handleAddUserModal = () => {
    setShowAddModal(true);
  };

  // Function to handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    form: "add" | "edit"
  ) => {
    const { name, value } = e.target;
    if (form === "add") {
      setAddForm((prevForm) => ({ ...prevForm, [name]: value }));
    } else {
      setEditForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  // Function to add a new user
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !addForm.name.trim() ||
      !addForm.email.trim() ||
      !addForm.password.trim()
    ) {
      toast.error("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/admin/add-user`,
        addForm,
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        toast.success("User added successfully");
        setShowAddModal(false);
        setAddForm({ name: "", email: "", password: "" });

        setTimeout(() => {
          fetchUsers(currentPage);
        }, 500);
      } else {
        toast.error(response.data.message || "Failed to add user");
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle edit user - modified to use currentUser
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "", // Don't fill password for security
    });
  };

  // Function to update a user - modified to use currentUser
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {
        ...editForm,
        // Only include password if it was actually entered
        ...(editForm.password.trim() ? { password: editForm.password } : {}),
      };

      const response = await axios.post(
        `${backendUrl}/api/admin/users/${currentUser._id}/update`,
        updateData,
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        toast.success("User updated successfully");
        setCurrentUser(null);
        fetchUsers(); // Refresh user list
      } else {
        toast.error(response.data.message || "Failed to update user");
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      // Make DELETE request with auth headers
      const response = await axios.post(
        `${backendUrl}/api/admin/users/${userId}/delete`,
        {},
        {
          withCredentials: true,
          headers: getAuthHeaders(),
        }
      );

      if (response.data.success) {
        toast.success("User deleted successfully");

        // Remove user from local state
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user._id !== userId)
        );
      } else {
        toast.error(response.data.message || "Error deleting user");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-slate-700 text-white hover:bg-slate-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Filter users based on search term
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={handleAddUserModal}
          className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded flex items-center"
        >
          <UserPlus size={18} className="mr-2" />
          Add User
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center bg-slate-800 rounded-lg p-2">
        <input
          type="text"
          placeholder="Search users..."
          className="bg-transparent border-none outline-none text-white flex-1 px-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-slate-800 p-8 rounded-lg text-center">
          <div className="animate-pulse text-gray-400">Loading users...</div>
        </div>
      ) : (
        <>
          {/* Users table */}
          <div className="bg-slate-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Current Progress
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Joined
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5} // Updated column span
                        className="px-6 py-8 text-center text-gray-400"
                      >
                        {isLoggedin
                          ? "No users found"
                          : "Please log in as an administrator to view users"}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const latestProgress = getLatestProgress(user._id);

                      return (
                        <tr key={user._id} className="hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {user.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {progressLoading ? (
                              <div className="text-sm text-gray-400">
                                Loading...
                              </div>
                            ) : (
                              <div className="text-sm text-gray-300">
                                {getProgressText(latestProgress)}
                                {latestProgress && (
                                  <Activity
                                    size={16}
                                    className="inline ml-2 text-green-400"
                                  />
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 hover:text-blue-300 mr-3"
                            >
                              <Pencil size={16} className="inline" />
                              <span className="ml-1 hidden sm:inline">
                                Edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash size={16} className="inline" />
                              <span className="ml-1 hidden sm:inline">
                                Delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination controls */}
          {renderPagination()}
        </>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={addForm.name}
                  onChange={(e) => handleInputChange(e, "add")}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Full Name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={addForm.email}
                  onChange={(e) => handleInputChange(e, "add")}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={addForm.password}
                  onChange={(e) => handleInputChange(e, "add")}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Password"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit User</h2>
              <button
                onClick={() => setCurrentUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={(e) => handleInputChange(e, "edit")}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange(e, "edit")}
                    className="w-full bg-slate-700 text-gray-500 px-3 py-2 rounded border border-slate-600 cursor-not-allowed"
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Password (leave blank to keep unchanged)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={editForm.password}
                    onChange={(e) => handleInputChange(e, "edit")}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCurrentUser(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="mr-2">Updating...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
