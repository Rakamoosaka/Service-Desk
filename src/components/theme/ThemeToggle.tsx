"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className={cn(
        "border-sidebar-border bg-panel text-foreground hover:border-accent hover:text-accent inline-flex h-10 w-10 items-center justify-center rounded-xl border transition duration-150 ease-out hover:shadow-[0_0_20px_rgb(from_var(--accent)_r_g_b/0.16)]",
        !mounted && "opacity-0",
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <SunMedium className="size-4" />
      ) : (
        <MoonStar className="size-4" />
      )}
    </button>
  );
}
