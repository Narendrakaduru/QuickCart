import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Package,
  Truck,
  CreditCard,
  XCircle,
  CheckCheck,
  ExternalLink,
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
  },
  order_status: {
    icon: Truck,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  order_payment: {
    icon: CreditCard,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  order_cancelled: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      dispatch(fetchNotifications());
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id));
    }
    setIsOpen(false);
    if (notification.orderId) {
      navigate(`/order/${notification.orderId}/track`);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    dispatch(markAllNotificationsRead());
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative cursor-pointer hover:text-blue-400 transition-colors p-1 focus:outline-none group"
        aria-label="Notifications"
        id="notification-bell"
      >
        <Bell
          size={20}
          className="transition-transform group-hover:scale-110"
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full h-[18px] min-w-[18px] px-1 flex items-center justify-center border-2 border-gray-900 shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 w-[380px] pt-3 z-[100]">
          <div className="bg-white text-gray-800 shadow-2xl rounded-2xl border border-gray-100 overflow-hidden ring-1 ring-black/5">
            {/* Header */}
            <div className="bg-gray-50/80 backdrop-blur-sm px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-blue-50"
                  id="mark-all-read-btn"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification Items */}
            <div className="max-h-[400px] overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">
                    No notifications yet
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    We'll let you know when something happens
                  </p>
                </div>
              ) : (
                recentNotifications.map((notification) => {
                  const config = typeConfig[notification.type] || typeConfig.order_placed;
                  const Icon = config.icon;
                  return (
                    <button
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 border-b border-gray-50 hover:bg-gray-50/80 transition-all cursor-pointer group ${
                        !notification.isRead ? "bg-blue-50/30" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center mt-0.5`}
                      >
                        <Icon size={16} className={config.color} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-[13px] truncate ${
                              !notification.isRead
                                ? "font-bold text-gray-900"
                                : "font-semibold text-gray-600"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-1">
                          {timeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/notifications");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-[12px] font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  id="view-all-notifications-btn"
                >
                  <ExternalLink size={13} />
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
