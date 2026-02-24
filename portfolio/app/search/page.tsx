import { ServiceListing } from "@/components/services/ServiceListing";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Find Services | SS-Infra",
    description: "Browse and book verified infrastructure owners and operators by district and taluka across Maharashtra.",
};

export default function SearchPage() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
            <Navbar />
            <div className="pt-28">
                <ServiceListing />
            </div>
            <Footer />
        </main>
    );
}
