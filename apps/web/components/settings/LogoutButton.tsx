"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button type="button" variant="soft" onClick={() => router.push("/")}>
      Se déconnecter
    </Button>
  );
}
