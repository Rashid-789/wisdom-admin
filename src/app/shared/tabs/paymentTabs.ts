import { paths } from "../../routes/paths";
import type { SectionTab } from "../ui/SectionTabs";

export const paymentTabs: SectionTab[] = [
  { label: "Transactions", to: paths.admin.payments.transactions},
  { label: "Plans", to: paths.admin.payments.plans },
  { label: "Refunds", to: paths.admin.payments.refunds },
];
