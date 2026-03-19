"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { setTheme } from "@/redux/slices/themeSlice";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const mode = useAppSelector((state) => state.theme.mode);
    const dispatch = useAppDispatch();
    const [mounted, setMounted] = useState(false);

    // Sync Redux store with actual client preference safely on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") {
            if (saved !== mode) dispatch(setTheme(saved as "light" | "dark"));
        } else {
            const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            if (systemPreference !== mode) dispatch(setTheme(systemPreference));
        }
    }, [dispatch, mode]);

    useEffect(() => {
        if (!mounted) return;
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(mode);
        document.documentElement.style.colorScheme = mode;
    }, [mode, mounted]);

    // Use "dark" default to match SSR before client hydrate
    return <div className={mounted ? mode : "dark"} suppressHydrationWarning>{children}</div>;
}
