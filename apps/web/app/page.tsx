import { Suspense } from "react";
import { UiWall } from "@/components/wall/UiWall";

export default function Home() {
  return (
    <Suspense>
      <UiWall />
    </Suspense>
  );
}
