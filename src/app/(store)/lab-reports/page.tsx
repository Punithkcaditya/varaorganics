import { permanentRedirect } from "next/navigation";
import { LAB_REPORTS_PATH } from "@/config/routes";

/** Preserve existing bookmarks while making /labreport the single canonical URL. */
export default function LegacyLabReportsPage() {
  permanentRedirect(LAB_REPORTS_PATH);
}
