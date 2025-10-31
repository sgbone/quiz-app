import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../supabaseClient";
import { useAuthStore } from "../store/authStore";

export default function Notifications() {
  const { session } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications", error);
    } else if (data) {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  const markAsRead = async (notificationId: number) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking as read", error);
    } else {
      fetchNotifications(); // Fetch lại để cập nhật UI
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-xs text-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 overflow-hidden"
          onClick={() => setIsOpen(false)}
        >
          <div className="p-4 font-bold text-gray-800 dark:text-white border-b dark:border-gray-700">
            Thông báo
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !notif.is_read ? "bg-indigo-50 dark:bg-indigo-900/50" : ""
                  }`}
                >
                  {notif.image_url && (
                    <img
                      src={notif.image_url}
                      alt="Notification"
                      className="rounded-lg mb-2 w-full object-cover"
                    />
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {notif.content}
                  </p>
                  {notif.link_url ? (
                    <a
                      href={notif.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-500 hover:underline text-sm font-semibold mt-2 inline-block"
                    >
                      Xem chi tiết →
                    </a>
                  ) : null}
                  <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-indigo-600 hover:underline"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-sm text-gray-500">
                Không có thông báo nào.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
