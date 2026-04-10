import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiTrash2,
  FiUserCheck,
  FiUserX,
  FiShield,
  FiDollarSign,
  FiRefreshCw,
  FiUsers,
  FiUser,
  FiCreditCard,
  FiClock,
  FiMail,
} from "react-icons/fi";
import toast from "react-hot-toast";
import UniversalPopup from "../../components/common/UniversalPopup";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const UserManagement = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters mapped
  const [search, setSearch] = useState("");
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Active User Context
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Modals state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Quick stats
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });

  useEffect(() => {
    fetchUsers();
    // close dropdown on click outside
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [getToken, search, selectedTier, selectedStatus, currentPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(search && { search }),
        ...(selectedTier && { tier: selectedTier }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const res = await axios.get(`${backendURL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setUsers(res.data.data);
        setTotalUsers(res.data.pagination.total);

        // Compute basic stats organically currently
        // In real app, you might want to fetch stats specifically
        const data = res.data.data;
        setStats({
          total: res.data.pagination.total,
          active: data.filter((u) => u.status === "active").length,
          suspended: data.filter((u) => u.status === "suspended").length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleToggleStatus = async (user) => {
    const isActivating = user.status === "suspended";
    const endpoint = isActivating ? "activate" : "suspend";

    // Quick confirmation
    if (
      !window.confirm(`Are you sure you want to ${endpoint} ${user.firstName}?`)
    )
      return;

    try {
      const token = await getToken();
      await axios.patch(
        `${backendURL}/api/admin/users/${user._id}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`User ${endpoint}d successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${endpoint} user`);
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to soft delete this user?"))
      return;
    try {
      const token = await getToken();
      await axios.delete(`${backendURL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  const handleRoleChange = async (role) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${backendURL}/api/admin/users/${selectedUser._id}/role`,
        { role },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success(`Role changed to ${role}`);
      setShowRoleModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to change role");
      console.error(error);
    }
  };

  const handleCreditsUpdate = async (amount) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${backendURL}/api/admin/users/${selectedUser._id}/credits`,
        { credits: amount },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Credits updated successfully");
      setShowCreditsModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update credits");
      console.error(error);
    }
  };

  // UI Helpers
  const openActionDropdown = (e, userId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  const openModal = (user, modalSetter) => {
    setSelectedUser(user);
    modalSetter(true);
    setOpenDropdownId(null);
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusClass = (status) => {
    if (status === "active")
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20";
    if (status === "suspended")
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20";
    return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20";
  };

  const getRoleClass = (role) => {
    if (role === "admin")
      return "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20";
    return "bg-white/6 text-zinc-300 ring-1 ring-white/10";
  };

  const getTierClass = (tier) => {
    if (!tier || tier === "Free")
      return "bg-white/6 text-zinc-300 ring-1 ring-white/10";
    return "bg-primary/15 text-primary ring-1 ring-primary/20";
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedTier("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const statsCards = [
    {
      label: "Total users",
      value: stats.total,
      icon: FiUsers,
      tone: "text-sky-300",
    },
    {
      label: "Active",
      value: stats.active,
      icon: FiUserCheck,
      tone: "text-emerald-300",
    },
    {
      label: "Suspended",
      value: stats.suspended,
      icon: FiUserX,
      tone: "text-amber-300",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface-alt/90 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_28%)]" />
        <div className="relative flex flex-col gap-4 px-4 py-4 md:px-6 md:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              <FiUsers size={12} /> Team administration
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                User Management
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-zinc-400">
                Compact control center for roles, subscriptions, credits, and
                account status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="min-w-[92px] rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-left shadow-sm shadow-black/10"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 ${stat.tone}`}
                    >
                      <Icon size={14} />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                        {stat.label}
                      </p>
                      <p className="text-base font-semibold text-white leading-none">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-surface-alt/90 backdrop-blur-xl shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <FiClock size={14} className="text-primary" />
            {totalUsers} users loaded
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-end">
            <div className="relative w-full lg:w-80">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search users"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <select
                value={selectedTier}
                onChange={(e) => {
                  setSelectedTier(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-primary/50"
              >
                <option value="">All plans</option>
                <option value="Free">Free</option>
                <option value="Student Flash">Student Flash</option>
                <option value="Placement Pro">Placement Pro</option>
                <option value="Infinite Elite">Infinite Elite</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-primary/50"
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
              <button
                onClick={clearFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white transition hover:bg-white/[0.08]"
              >
                <FiFilter size={14} /> Reset
              </button>
              <button
                onClick={fetchUsers}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 text-sm font-medium text-primary transition hover:bg-primary/15"
              >
                <FiRefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[#111214]">
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Credits</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-sm text-zinc-500"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user._id}
                    onClick={() => navigate(`/admin/users/${user._id}`)}
                    className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] cursor-pointer"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-primary/15 text-sm font-semibold text-primary">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.firstName?.[0] || <FiUser size={14} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="truncate text-xs text-zinc-500">
                            {user.subscription?.tier || "Free"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-400">
                      <div className="flex items-center gap-2 min-w-0">
                        <FiMail size={12} className="shrink-0 text-zinc-600" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${getRoleClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getTierClass(user.subscription?.tier)}`}
                      >
                        {user.subscription?.tier || "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-mono text-zinc-200">
                        <FiCreditCard size={11} className="text-primary" />
                        {user.subscription?.credits || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${getStatusClass(user.status)}`}
                      >
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
                        {user.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3.5 text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => openActionDropdown(e, user._id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 transition hover:border-white/20 hover:text-white"
                        aria-label={`Open actions for ${user.firstName} ${user.lastName}`}
                      >
                        <FiMoreVertical size={15} />
                      </button>

                      {openDropdownId === user._id && (
                        <div className="absolute right-3 top-12 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#101114] shadow-2xl shadow-black/40">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(user);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/5"
                          >
                            {user.status === "suspended" ? (
                              <FiUserCheck size={14} />
                            ) : (
                              <FiUserX size={14} />
                            )}
                            {user.status === "suspended"
                              ? "Activate user"
                              : "Suspend user"}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(user, setShowCreditsModal);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/5"
                          >
                            <FiDollarSign size={14} /> Manage credits
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(user, setShowRoleModal);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-white/5"
                          >
                            <FiShield size={14} /> Change role
                          </button>
                          <div className="my-1 border-t border-white/5" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user._id);
                            }}
                            disabled={user.status === "deleted"}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                          >
                            <FiTrash2 size={14} /> Soft delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-12 text-center text-sm text-zinc-500"
                  >
                    No users found for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface-alt/90 px-4 py-3 text-sm backdrop-blur-xl">
        <span className="text-zinc-500">Page {currentPage}</span>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft size={15} />
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
          >
            <FiChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Modals using UniversalPopup */}

      {/* 1. View User Modal */}
      <UniversalPopup
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Profile"
        description="Detailed view of user statistics"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex gap-4 items-center mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                {selectedUser.firstName[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-zinc-400">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Joined</p>
                <p className="text-white font-medium">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Last Login</p>
                <p className="text-white font-medium">
                  {selectedUser.lastLogin
                    ? formatDate(selectedUser.lastLogin)
                    : "N/A"}
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Role</p>
                <p className="text-white font-medium capitalize">
                  {selectedUser.role}
                </p>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-xs text-zinc-500 mb-1">Current Plan</p>
                <p className="text-primary font-medium">
                  {selectedUser.subscription?.tier || "Free"}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </UniversalPopup>

      {/* 2. Credits Modal */}
      <UniversalPopup
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        title="Manage Credits"
        description="Quickly assign credits for AI usage."
      >
        {selectedUser && (
          <div>
            <div className="bg-black/30 p-4 rounded-xl border border-primary/20 mb-6 flex justify-between items-center">
              <span className="text-zinc-400">Current Balance:</span>
              <span className="text-2xl font-black text-white font-mono">
                {selectedUser.subscription?.credits || 0}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() =>
                  handleCreditsUpdate(
                    (selectedUser.subscription?.credits || 0) + 50,
                  )
                }
                className="px-4 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-all font-bold"
              >
                +50 Credits
              </button>
              <button
                onClick={() =>
                  handleCreditsUpdate(
                    (selectedUser.subscription?.credits || 0) + 100,
                  )
                }
                className="px-4 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-all font-bold"
              >
                +100 Credits
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleCreditsUpdate(0)}
                className="flex-1 px-4 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
              >
                Reset to 0
              </button>
            </div>
          </div>
        )}
      </UniversalPopup>

      {/* 3. Role Modal */}
      <UniversalPopup
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change Authority Role"
        description="Modify the user's access boundaries."
      >
        {selectedUser && (
          <div className="space-y-4">
            <button
              onClick={() => handleRoleChange("user")}
              className={`w-full p-4 rounded-xl border text-left flex gap-4 transition-all ${
                selectedUser.role === "user"
                  ? "bg-primary/10 border-primary shadow-sm shadow-primary/20"
                  : "bg-black/30 border-white/5 hover:border-white/20"
              }`}
            >
              <div
                className={`p-2 rounded-lg h-fit ${selectedUser.role === "user" ? "bg-primary text-black" : "bg-white/10 text-white"}`}
              >
                <FiUserCheck size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Standard User</h4>
                <p className="text-xs text-zinc-500">
                  Normal permissions to use the platform naturally.
                </p>
              </div>
            </button>

            <button
              onClick={() => handleRoleChange("admin")}
              className={`w-full p-4 rounded-xl border text-left flex gap-4 transition-all ${
                selectedUser.role === "admin"
                  ? "bg-primary/10 border-primary shadow-sm shadow-primary/20"
                  : "bg-black/30 border-white/5 hover:border-white/20"
              }`}
            >
              <div
                className={`p-2 rounded-lg h-fit ${selectedUser.role === "admin" ? "bg-primary text-black" : "bg-white/10 text-white"}`}
              >
                <FiShield size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">
                  System Administrator
                </h4>
                <p className="text-xs text-zinc-500">
                  Unrestricted access. Use with caution.
                </p>
              </div>
            </button>
          </div>
        )}
      </UniversalPopup>
    </div>
  );
};

export default UserManagement;
