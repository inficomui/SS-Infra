"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const mode = useAppSelector((state) => state.theme.mode);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", mode === "dark");
        document.documentElement.classList.toggle("light", mode === "light");
    }, [mode]);

    return <div className={mode}>{children}</div>;
}
