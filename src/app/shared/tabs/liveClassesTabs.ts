import { paths } from "../../routes/paths";
import type { SectionTab } from "../ui/SectionTabs";

export const liveClassesTabs: SectionTab[] = [
  { label: "Sessions", to: paths.admin.liveClasses.list },
  { label: "Calendar", to: paths.admin.liveClasses.calendar },
];
