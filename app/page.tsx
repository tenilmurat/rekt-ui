import { redirect } from "next/navigation";
import { firstCategory } from "@/lib/registry";

export default function Home() {
  redirect(`/${firstCategory.id}`);
}
