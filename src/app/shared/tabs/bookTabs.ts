import { paths } from "../../routes/paths";
import type { SectionTab } from "../ui/SectionTabs";

export const bookTabs: SectionTab[] = [
  { label: "Books", to: paths.admin.books.list },
  { label: "Orders", to: paths.admin.books.orders },
];
