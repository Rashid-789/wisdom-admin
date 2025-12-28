import { paths } from "../../routes/paths";
import type { SectionTab } from "../ui/SectionTabs";

export const settingsTabs: SectionTab[] = [
  { label: "Account", to: paths.admin.settings.account,},
  { label: "Notifications", to: paths.admin.settings.notifications },
];
