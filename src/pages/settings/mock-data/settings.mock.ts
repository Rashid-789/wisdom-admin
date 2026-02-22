import type { SettingsSnapshot } from "../Types/settings.types";

export const DEFAULT_SETTINGS: SettingsSnapshot = {
  account: {
    id: "",
    email: "",
    displayName: "Admin",
    username: "admin",
    avatarUrl: null,
  },
  notifications: {
    email: {
      newUserSignup: true,
      newPurchase: true,
      refundRequests: true,
      liveClassReminders: true,
      weeklySummary: false,
    },
  },
};