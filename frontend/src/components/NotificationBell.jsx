import React, { useEffect, useState } from 'react';

export default function NotificationBell({ role = 'tailor' }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const apiHost = window.location.hostname || 'localhost';
      const res = await fetch(`http://${apiHost}:5000/api/v1/notifications?role=${role}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
          const unread = data.notifications.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      }
    } catch (err) {
      console.warn('Notifications fetch note:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Polling every 5 sec for real-time notifications
    return () => clearInterval(interval);
  }, [role]);

  const markAsRead = async (id) => {
    try {
      const apiHost = window.location.hostname || 'localhost';
      await fetch(`http://${apiHost}:5000/api/v1/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (id === 'all' || n._id === id || n.notificationId === id ? { ...n, isRead: true } : n))
      );
      if (id === 'all') setUnreadCount(0);
      else setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center"
        title="Tailor & Admin Notifications"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Persistent Notification Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-pink-100 z-50 overflow-hidden text-gray-800">
          <div className="bg-gradient-to-r from-pink-900 to-rose-800 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <span>🔔 Notifications ({role.toUpperCase()})</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead('all')}
                className="text-[11px] bg-white/20 hover:bg-white/30 text-white px-2 py-0.5 rounded font-medium transition"
              >
                Mark All Read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-pink-50 p-2">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif._id || notif.notificationId}
                  className={`p-3 rounded-xl transition flex gap-3 text-xs ${
                    notif.isRead ? 'bg-white text-gray-600' : 'bg-pink-50/80 font-semibold text-gray-900 border-l-4 border-rose-600'
                  }`}
                >
                  <div className="text-lg">
                    {notif.type === 'GARMENT_MISMATCH' && '⚠️'}
                    {notif.type === 'GARMENT_VERIFIED' && '✅'}
                    {notif.type === 'READY_FOR_DELIVERY' && '📦'}
                    {notif.type === 'PAYMENT_RECEIVED' && '💳'}
                    {(!notif.type || notif.type === 'ORDER_CREATED') && '🏷️'}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className={`font-bold ${notif.type === 'GARMENT_MISMATCH' ? 'text-red-700' : 'text-pink-950'}`}>
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-700">{notif.message}</p>

                    {notif.metadata && (
                      <div className="bg-white p-2 rounded-lg border border-pink-100 text-[10px] space-y-0.5 text-gray-600 mt-1">
                        {notif.metadata.customerName && <div><strong>Customer:</strong> {notif.metadata.customerName}</div>}
                        {notif.metadata.nextAction && <div><strong>Action:</strong> <span className="text-rose-700 font-bold">{notif.metadata.nextAction}</span></div>}
                      </div>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id || notif.notificationId)}
                        className="text-[10px] font-bold text-rose-700 hover:text-rose-900 underline mt-1"
                      >
                        Dismiss / Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-400 text-xs font-medium">
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
