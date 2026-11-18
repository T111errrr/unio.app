/** Status onboarding disimpan lokal dulu; nanti dipindah ke profil (fase backend). */
const ONBOARDING_KEY = "unio-onboarding";
const NOTIF_KEY = "unio-notifications";

export type NotificationResult = "granted" | "denied" | "default" | "unsupported";

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* penyimpanan tidak tersedia: lewati */
  }
}

export function markOnboardingFinished(status: "done" | "skipped") {
  write(ONBOARDING_KEY, status);
}

export function saveNotificationChoice(choice: NotificationResult | "skipped") {
  write(NOTIF_KEY, choice);
}

export async function requestNotificationPermission(): Promise<NotificationResult> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "unsupported";
  }
}
