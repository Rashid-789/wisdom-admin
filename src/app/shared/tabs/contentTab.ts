import { paths } from "../../routes/paths";
import type { SectionTab } from "../../shared"; 
// ^ adjust if your type export is different (or from "../../shared")

export const contentTabs: SectionTab[] = [
  { label: "Subjects", to: paths.admin.content.subjects,},
  { label: "Courses", to: paths.admin.content.courses },
  { label: "Lectures", to: paths.admin.content.lectures },
  { label: "Exercises", to: paths.admin.content.exercises },
];
