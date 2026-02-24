import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/session";
import Navbar from "@/components/dashboard/navbar";
import OfflineBanner from "@/components/pwa/offline-banner";
import InstallPrompt from "@/components/pwa/install-prompt";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#fffbf5]">
      <Navbar user={user} />
      <OfflineBanner />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {children}
      </main>
      <InstallPrompt />
    </div>
  );
}
