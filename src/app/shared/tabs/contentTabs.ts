import type { SectionTab } from "../ui/SectionTabs";
import { paths } from "../../routes/paths";

export const contentTabs: SectionTab[] = [
  { label: "Basic Subjects", to: paths.admin.content.basicSubjects },
  { label: "Skill Subjects", to: paths.admin.content.skillSubjects },
];
