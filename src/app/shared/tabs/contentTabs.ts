import type { SectionTab } from "../ui/SectionTabs";
import { paths } from "../../routes/paths";

export const contentTabs: SectionTab[] = [
  { label: "Basic Courses", to: paths.admin.content.basicCourses },
  { label: "Skill Courses", to: paths.admin.content.skillCourses },
];
