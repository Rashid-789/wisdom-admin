import type { SectionTab } from "../SectionTabs";
import { paths } from "../../routes/paths";

export const contentTabs: SectionTab[] = [
  { label: "Subjects", to: paths.admin.content.subjects },
  { label: "Courses", to: paths.admin.content.courses },
];