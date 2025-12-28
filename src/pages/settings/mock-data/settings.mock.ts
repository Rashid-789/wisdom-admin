import type { SettingsSnapshot } from "../Types/settings.types";

export const DEFAULT_SETTINGS: SettingsSnapshot = {
  account: {
    id: "admin_1",
    email: "admin@domain.com",
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

