import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import {
  FiArrowLeft,
  FiActivity,
  FiVideo,
  FiUsers,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiCreditCard,
  FiDollarSign,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import UniversalPopup from "../../components/common/UniversalPopup";

const backendURL = import.meta.env.VITE_BACKEND_URL;
const billingCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const initialSubscriptionForm = {
  tier: "Free",
  creditsToAdd: "0",
  extendDays: "0",
};

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingHistory, setBillingHistory] = useState([]);
  const [billingPagination, setBillingPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
  });
  const [billingPage, setBillingPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [creditsValue, setCreditsValue] = useState("");
  const [subscriptionForm, setSubscriptionForm] = useState(
    initialSubscriptionForm,
  );

  useEffect(() => {
    setUser(null);
    setBillingHistory([]);
    setBillingPagination({ page: 1, pages: 1, total: 0, limit: 10 });
    setBillingPage(1);
    loadUserDetails();
  }, [userId]);

  useEffect(() => {
    if (user) {
      loadBillingHistory(billingPage);
    }
  }, [user, billingPage]);

  const authHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  const formatDate = (date) => {
    if (!date) return "No data";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amountInPaise) =>
    billingCurrencyFormatter.format((amountInPaise || 0) / 100);

  const displayName = () => {
    const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return name || user?.email || "Unknown User";
  };

  const avatarInitial = () => {
    const source = user?.firstName || user?.email || "?";
    return source.charAt(0).toUpperCase();
  };

  const getRoleClasses = (role) =>
    role === "admin"
      ? "bg-purple-500/20 text-purple-300 border-purple-500/20"
      : "bg-white/10 text-zinc-200 border-white/10";

  const getStatusClasses = (status) => {
    if (status === "active")
      return "bg-green-500/20 text-green-300 border-green-500/20";
    if (status === "suspended")
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/20";
    return "bg-red-500/20 text-red-300 border-red-500/20";
  };

  const getOrderStatusClasses = (status) => {
    if (status === "paid")
      return "bg-green-500/20 text-green-300 border-green-500/20";
    if (status === "refunded")
      return "bg-cyan-500/20 text-cyan-300 border-cyan-500/20";
    if (status === "failed")
      return "bg-red-500/20 text-red-300 border-red-500/20";
    return "bg-white/10 text-zinc-300 border-white/10";
  };

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const headers = await authHeaders();
      const res = await axios.get(`${backendURL}/api/admin/users/${userId}`, {
        headers,
      });

      if (res.data.success) {
        setUser(res.data.data);
        setCreditsValue(String(res.data.data.subscription?.credits ?? 0));
        setSubscriptionForm({
          tier: res.data.data.subscription?.tier || "Free",
          creditsToAdd: "0",
          extendDays: "0",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const loadBillingHistory = async (page = 1) => {
    try {
      setBillingLoading(true);
      const headers = await authHeaders();
      const res = await axios.get(
        `${backendURL}/api/admin/users/${userId}/billing-history?page=${page}&limit=10`,
        {
          headers,
        },
      );

      if (res.data.success) {
        setBillingHistory(res.data.data || []);
        setBillingPagination({
          page: res.data.pagination?.page || 1,
          pages: Math.max(res.data.pagination?.pages || 1, 1),
          total: res.data.pagination?.total || 0,
          limit: res.data.pagination?.limit || 10,
        });
      }
    } catch (error) {
      console.error("Failed to fetch billing history:", error);
      toast.error("Failed to load billing history");
    } finally {
      setBillingLoading(false);
    }
  };

  const refreshAll = async () => {
    await loadUserDetails();
    await loadBillingHistory(billingPage);
  };

  const handleToggleStatus = async () => {
    const nextAction = user?.status === "suspended" ? "activate" : "suspend";
    if (!window.confirm(`Are you sure you want to ${nextAction} this user?`))
      return;

    try {
      setActionLoading(true);
      const headers = await authHeaders();
      await axios.patch(
        `${backendURL}/api/admin/users/${userId}/${nextAction}`,
        {},
        { headers },
      );
      toast.success(`User ${nextAction}d successfully`);
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${nextAction} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (role) => {
    try {
      setActionLoading(true);
      const headers = await authHeaders();
      await axios.patch(
        `${backendURL}/api/admin/users/${userId}/role`,
        { role },
        { headers },
      );
      toast.success(`Role changed to ${role}`);
      setShowRoleModal(false);
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to change role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreditsUpdate = async () => {
    const parsedCredits = Number(creditsValue);
    if (Number.isNaN(parsedCredits)) {
      toast.error("Credits must be a valid number");
      return;
    }

    try {
      setActionLoading(true);
      const headers = await authHeaders();
      await axios.patch(
        `${backendURL}/api/admin/users/${userId}/credits`,
        { credits: parsedCredits },
        { headers },
      );
      toast.success("Credits updated successfully");
      setShowCreditsModal(false);
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update credits");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubscriptionUpdate = async () => {
    const creditsToAdd = Number(subscriptionForm.creditsToAdd || 0);
    const extendDays = Number(subscriptionForm.extendDays || 0);

    if (Number.isNaN(creditsToAdd) || Number.isNaN(extendDays)) {
      toast.error("Subscription values must be numeric");
      return;
    }

    try {
      setActionLoading(true);
      const headers = await authHeaders();
      await axios.patch(
        `${backendURL}/api/admin/users/${userId}/subscription`,
        {
          tier: subscriptionForm.tier,
          creditsToAdd,
          extendDays,
        },
        { headers },
      );
      toast.success("Subscription updated successfully");
      setShowSubscriptionModal(false);
      await refreshAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm("This will soft delete the user. Continue?")) return;

    if (deleteConfirmText !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }

    try {
      setActionLoading(true);
      const headers = await authHeaders();
      await axios.delete(`${backendURL}/api/admin/users/${userId}`, {
        headers,
      });
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      navigate("/admin/users");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user");
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = () => setShowRoleModal(true);
  const openCreditsModal = () => setShowCreditsModal(true);
  const openSubscriptionModal = () => setShowSubscriptionModal(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[420px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-zinc-400 py-12">
        <p>User not found</p>
      </div>
    );
  }

  const subscription = user.subscription || {};
  const latestOrder = user.billingSummary?.latestOrder;
  const adjustments = subscription.manualAdjustments || [];

  return (
    <div className="space-y-4 max-w-none mx-auto px-2 lg:px-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="p-2 bg-zinc-900 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
          >
            <FiArrowLeft className="text-white" size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              User Details
            </h1>
            <p className="text-zinc-400 mt-1">
              Comprehensive admin view of profile, usage, billing, and controls
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={refreshAll}
            disabled={actionLoading}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-xl border transition-colors flex items-center gap-2 disabled:opacity-50 ${
              user.status === "suspended"
                ? "bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20"
                : "bg-yellow-500/10 border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20"
            }`}
          >
            {user.status === "suspended" ? (
              <FiUserCheck size={16} />
            ) : (
              <FiUserX size={16} />
            )}
            {user.status === "suspended" ? "Activate" : "Suspend"}
          </button>
          <button
            onClick={openRoleModal}
            disabled={actionLoading}
            className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/30 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FiShield size={16} />
            Change Role
          </button>
          <button
            onClick={openCreditsModal}
            disabled={actionLoading}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FiDollarSign size={16} />
            Credits
          </button>
          <button
            onClick={openSubscriptionModal}
            disabled={actionLoading}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FiCreditCard size={16} />
            Subscription
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={actionLoading || user.status === "deleted"}
            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase font-semibold">
            Mock Interviews
          </p>
          <p className="text-3xl font-black text-white mt-2">
            {user.interviewCount || 0}
          </p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase font-semibold">
            GD Sessions
          </p>
          <p className="text-3xl font-black text-white mt-2">
            {user.gdSessionCount || 0}
          </p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase font-semibold">
            Billing Orders
          </p>
          <p className="text-3xl font-black text-white mt-2">
            {user.billingSummary?.totalOrders || 0}
          </p>
        </div>
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase font-semibold">
            Last Payment
          </p>
          <p className="text-lg font-semibold text-white mt-2">
            {latestOrder ? formatDate(latestOrder.createdAt) : "No payments"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-white/10 rounded-[28px] p-6 space-y-5">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-5 border-2 border-primary/30 overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-primary">
                  {avatarInitial()}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {displayName()}
            </h2>
            <p className="text-zinc-400 mb-4 break-all">{user.email}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wider border ${getRoleClasses(user.role)}`}
              >
                {user.role}
              </span>
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wider border ${getStatusClasses(user.status)}`}
              >
                {user.status}
              </span>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/5 pt-5 text-left">
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                Joined
              </p>
              <p className="text-sm text-zinc-200">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                Last Login
              </p>
              <p className="text-sm text-zinc-200">
                {user.lastLogin
                  ? formatDate(user.lastLogin)
                  : "No login recorded"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                User ID
              </p>
              <p className="text-sm text-zinc-200 break-all">{user._id}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                Clerk ID
              </p>
              <p className="text-sm text-zinc-200 break-all">
                {user.clerkId || "Unavailable"}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-900 border border-white/10 rounded-[28px] p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <FiActivity className="text-primary" /> Subscription Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                  Plan
                </p>
                <p className="text-lg font-bold text-primary">
                  {subscription.tier || "Free"}
                </p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                  Credits
                </p>
                <p className="text-lg font-mono font-bold text-white">
                  {subscription.credits ?? 0}
                </p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                  Status
                </p>
                <p className="text-lg font-bold text-white">
                  {subscription.status || "active"}
                </p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                  Billing Cycle
                </p>
                <p className="text-lg font-medium text-white">
                  {subscription.billingCycle || "N/A"}
                </p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                  Expiry
                </p>
                <p className="text-lg font-medium text-white">
                  {subscription.planExpiry
                    ? formatDate(subscription.planExpiry)
                    : "No expiry"}
                </p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                  Top-up Credits
                </p>
                <p className="text-lg font-medium text-white">
                  {subscription.topupCredits ?? 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5">
                <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                  Leftover Free Credits
                </p>
                <p className="text-lg font-medium text-white">
                  {subscription.leftoverFreeCredits ?? 0}
                </p>
              </div>
              <div className="bg-black/30 p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">
                    Last Payment At
                  </p>
                  <p className="text-lg font-medium text-white">
                    {subscription.lastPaymentAt
                      ? formatDate(subscription.lastPaymentAt)
                      : "N/A"}
                  </p>
                </div>
                <FiCreditCard className="text-primary" size={22} />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-[28px] p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <FiClock className="text-primary" /> Platform Usage
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                  <FiVideo size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">
                    {user.interviewCount || 0}
                  </p>
                  <p className="text-sm text-zinc-400">Mock Interviews</p>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                  <FiUsers size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black text-white">
                    {user.gdSessionCount || 0}
                  </p>
                  <p className="text-sm text-zinc-400">GD Sessions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-[28px] p-6 lg:col-span-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <FiList className="text-primary" /> Billing History
            </h3>

            {billingLoading ? (
              <div className="py-10 flex justify-center">
                <div className="h-10 w-10 rounded-full border-b-2 border-primary animate-spin" />
              </div>
            ) : billingHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-white/5 w-full">
                  <table className="w-full min-w-[920px] text-left text-sm">
                    <thead className="bg-black/30 text-zinc-400 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((order) => (
                        <tr
                          key={order._id}
                          className="border-t border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">
                              {order.planName || "Unknown plan"}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {order.billingCycle || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white font-mono">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getOrderStatusClasses(order.status)}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-300">
                            {order.paymentDetails?.method ? (
                              <>
                                <div>{order.paymentDetails.method}</div>
                                <div className="text-xs text-zinc-500">
                                  {order.paymentDetails.cardNetwork
                                    ? `${order.paymentDetails.cardNetwork} • ${order.paymentDetails.cardLast4 || "----"}`
                                    : ""}
                                </div>
                              </>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-4 py-3 text-zinc-300">
                            {formatDate(order.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-sm text-zinc-500">
                    Showing {billingHistory.length} of {billingPagination.total}{" "}
                    records
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setBillingPage((page) => Math.max(1, page - 1))
                      }
                      disabled={billingPage === 1}
                      className="p-2 bg-white/5 rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors"
                    >
                      <FiChevronLeft className="text-white" />
                    </button>
                    <span className="text-sm text-zinc-300 px-2">
                      Page {billingPagination.page || billingPage} of{" "}
                      {billingPagination.pages || 1}
                    </span>
                    <button
                      onClick={() =>
                        setBillingPage((page) =>
                          Math.min(billingPagination.pages || 1, page + 1),
                        )
                      }
                      disabled={billingPage >= (billingPagination.pages || 1)}
                      className="p-2 bg-white/5 rounded-lg disabled:opacity-40 hover:bg-white/10 transition-colors"
                    >
                      <FiChevronRight className="text-white" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                    <FiCheckCircle className="text-green-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-semibold">
                        Paid Orders
                      </p>
                      <p className="text-lg text-white font-semibold">
                        {user.billingSummary?.paidOrders || 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                    <FiAlertTriangle className="text-yellow-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-semibold">
                        Failed Orders
                      </p>
                      <p className="text-lg text-white font-semibold">
                        {user.billingSummary?.failedOrders || 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                    <FiXCircle className="text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-semibold">
                        Refunded Orders
                      </p>
                      <p className="text-lg text-white font-semibold">
                        {user.billingSummary?.refundedOrders || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                No billing records found for this user.
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-white/10 rounded-[28px] p-6 lg:col-span-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <FiCalendar className="text-primary" /> Manual Subscription
              Adjustments
            </h3>
            {adjustments.length > 0 ? (
              <div className="space-y-3">
                {adjustments
                  .slice()
                  .reverse()
                  .map((adjustment, index) => (
                    <div
                      key={`${adjustment.date}-${index}`}
                      className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="text-white font-semibold capitalize">
                          {(adjustment.type || "credit_add").replace("_", " ")}
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                          {adjustment.reason || "No reason provided"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {adjustment.amount ?? 0}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {formatDate(adjustment.date)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-zinc-500">
                No manual adjustments recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      <UniversalPopup
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change Role"
        description="Switch this user's access level."
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          <button
            onClick={() => handleRoleChange("user")}
            disabled={actionLoading}
            className={`w-full p-4 rounded-xl border text-left flex gap-4 transition-all disabled:opacity-50 ${
              user.role === "user"
                ? "bg-primary/10 border-primary"
                : "bg-black/30 border-white/5 hover:border-white/20"
            }`}
          >
            <div
              className={`p-2 rounded-lg h-fit ${user.role === "user" ? "bg-primary text-black" : "bg-white/10 text-white"}`}
            >
              <FiUserCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Standard User</h4>
              <p className="text-xs text-zinc-500">
                Normal permissions to use the platform.
              </p>
            </div>
          </button>

          <button
            onClick={() => handleRoleChange("admin")}
            disabled={actionLoading}
            className={`w-full p-4 rounded-xl border text-left flex gap-4 transition-all disabled:opacity-50 ${
              user.role === "admin"
                ? "bg-primary/10 border-primary"
                : "bg-black/30 border-white/5 hover:border-white/20"
            }`}
          >
            <div
              className={`p-2 rounded-lg h-fit ${user.role === "admin" ? "bg-primary text-black" : "bg-white/10 text-white"}`}
            >
              <FiShield size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">
                System Administrator
              </h4>
              <p className="text-xs text-zinc-500">
                Full admin access. Use carefully.
              </p>
            </div>
          </button>
        </div>
      </UniversalPopup>

      <UniversalPopup
        isOpen={showCreditsModal}
        onClose={() => setShowCreditsModal(false)}
        title="Manage Credits"
        description="Set the user's subscription credit balance."
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-zinc-400">Current Balance</span>
            <span className="text-2xl font-black text-white font-mono">
              {subscription.credits ?? 0}
            </span>
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-400">Credits</span>
            <input
              type="number"
              value={creditsValue}
              onChange={(e) => setCreditsValue(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50"
            />
          </label>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowCreditsModal(false)}
              className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleCreditsUpdate}
              disabled={actionLoading}
              className="px-4 py-2 bg-primary text-black rounded-xl font-semibold disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </UniversalPopup>

      <UniversalPopup
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        title="Update Subscription"
        description="Change tier, add credits, or extend the expiry date."
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm text-zinc-400">Tier</span>
            <select
              value={subscriptionForm.tier}
              onChange={(e) =>
                setSubscriptionForm((prev) => ({
                  ...prev,
                  tier: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50"
            >
              <option value="Free">Free</option>
              <option value="Student Flash">Student Flash</option>
              <option value="Placement Pro">Placement Pro</option>
              <option value="Infinite Elite">Infinite Elite</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-400">Credits to Add</span>
            <input
              type="number"
              value={subscriptionForm.creditsToAdd}
              onChange={(e) =>
                setSubscriptionForm((prev) => ({
                  ...prev,
                  creditsToAdd: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-400">Extend Days</span>
            <input
              type="number"
              value={subscriptionForm.extendDays}
              onChange={(e) =>
                setSubscriptionForm((prev) => ({
                  ...prev,
                  extendDays: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50"
            />
          </label>

          <div className="md:col-span-2 flex gap-3 justify-end mt-2">
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSubscriptionUpdate}
              disabled={actionLoading}
              className="px-4 py-2 bg-primary text-black rounded-xl font-semibold disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </UniversalPopup>

      <UniversalPopup
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Soft Delete User"
        description="This will mark the user as deleted, but keep the record for admin history."
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-zinc-300">
            Type <span className="font-semibold text-white">DELETE</span> to
            confirm this action.
          </p>
          <input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full px-4 py-3 bg-zinc-950 border border-white/10 rounded-xl text-white outline-none focus:border-red-500/50"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 bg-white/5 rounded-xl text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={actionLoading || deleteConfirmText !== "DELETE"}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </UniversalPopup>
    </div>
  );
};

export default UserDetail;
