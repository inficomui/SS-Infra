import type { Metadata } from "next";
import { StoreProvider } from "@/store/StoreProvider";
import { ThemeProvider } from "@/store/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SS-Infra | Smart Infrastructure Workforce Management",
  description: "SS-Infra is a powerful mobile platform for managing infrastructure operators, tracking work sessions, fleet, fuel, maintenance, and payroll — all in one place.",
  keywords: "infrastructure management, workforce tracking, operator management, fleet management, construction app",
  openGraph: {
    title: "SS-Infra | Smart Infrastructure Workforce Management",
    description: "Manage your entire infrastructure workforce from one powerful mobile platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
