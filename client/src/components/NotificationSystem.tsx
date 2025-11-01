import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/stores/useGameStore";

interface Notification {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  duration: number;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state, prevState) => {
      if (state.collectedCount > prevState.collectedCount) {
        addNotification("Resource collected!", "success", 2000);
      }
      
      if (state.currency > prevState.currency) {
        const diff = state.currency - prevState.currency;
        addNotification(`+${diff} currency earned`, "success", 2000);
      }
      
      const cargoCount = state.getCargoCount();
      const maxCargo = state.getMaxCargo();
      if (cargoCount >= maxCargo && prevState.getCargoCount() < prevState.getMaxCargo()) {
        addNotification("Cargo hold full!", "warning", 3000);
      }
      
      if (state.phase === "playing" && prevState.phase !== "playing") {
        addNotification("Game started - Explore and collect!", "info", 3000);
      }
    });

    return unsubscribe;
  }, []);

  const addNotification = (message: string, type: Notification["type"], duration: number = 3000) => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-900/90 border-green-500 text-green-100";
      case "warning":
        return "bg-yellow-900/90 border-yellow-500 text-yellow-100";
      case "error":
        return "bg-red-900/90 border-red-500 text-red-100";
      case "info":
      default:
        return "bg-blue-900/90 border-blue-500 text-blue-100";
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${getTypeStyles(notif.type)} border px-4 py-2 rounded-lg shadow-lg
            animate-in slide-in-from-right duration-300 backdrop-blur-sm`}
        >
          <p className="text-sm font-medium">{notif.message}</p>
        </div>
      ))}
    </div>
  );
}
