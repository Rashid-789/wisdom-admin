export type AdminAccount = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
};

export type UpdateAccountInput = {
  displayName: string;
  username: string;
};

export type NotificationPrefs = {
  email: {
    newUserSignup: boolean;
    newPurchase: boolean;
    refundRequests: boolean;
    liveClassReminders: boolean;
    weeklySummary: boolean;
  };
};

export type SettingsSnapshot = {
  account: AdminAccount;
  notifications: NotificationPrefs;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

