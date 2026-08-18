import { useEffect, useState } from "react";

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[100] border-b border-[#e8bd72] bg-[#fff4d6]/95 px-4 py-2 text-center text-xs font-semibold text-[#5d4328] shadow-sm backdrop-blur"
      role="status"
      aria-live="polite"
    >
      Offline mode: your dashboard and saved worlds remain available on this
      device.
    </div>
  );
}
