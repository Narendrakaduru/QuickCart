import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Package,
  Truck,
  CreditCard,
  XCircle,
  CheckCheck,
  ArrowLeft,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../slices/notificationSlice";

const typeConfig = {
  order_placed: {
    icon: Package,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  order_status: {
    icon: Truck,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  order_payment: {
    icon: CreditCard,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  order_cancelled: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
};

const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount, isLoading } = useSelector(
    (state) => state.notifications
  );

  useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    if (notification.orderId) {
      navigate(`/order/${notification.orderId}/track`);
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 max-w-4xl py-16 text-center">
        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-semibold">
          Please log in to view your notifications
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
            id="page-mark-all-read-btn"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-200"></div>
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded-lg w-1/3"></div>
                  <div className="h-3 bg-gray-100 rounded-lg w-2/3"></div>
                  <div className="h-2.5 bg-gray-100 rounded-lg w-1/5"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Bell size={36} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            No notifications
          </h3>
          <p className="text-sm text-gray-400">
            When you place orders or receive updates, they'll show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification) => {
            const config =
              typeConfig[notification.type] || typeConfig.order_placed;
            const Icon = config.icon;
            return (
              <button
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full text-left bg-white rounded-2xl p-4 md:p-5 flex items-start gap-4 border transition-all hover:shadow-md hover:scale-[1.005] cursor-pointer group ${
                  !notification.isRead
                    ? `border-l-4 ${config.border} border-l-blue-400 shadow-sm`
                    : "border-gray-100"
                }`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center`}
                >
                  <Icon size={20} className={config.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3
                        className={`text-sm truncate ${
                          !notification.isRead
                            ? "font-bold text-gray-900"
                            : "font-semibold text-gray-600"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                    <span className="shrink-0 text-[11px] text-gray-400 font-semibold">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p
                    className={`text-[13px] mt-1 leading-relaxed ${
                      !notification.isRead ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {notification.message}
                  </p>
                  {notification.orderId && (
                    <p className="text-[11px] text-blue-500 font-bold mt-2 group-hover:text-blue-600 transition-colors">
                      View order details →
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
