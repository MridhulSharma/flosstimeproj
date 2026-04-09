import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import AIProvider from "@/components/ai/AIProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AIProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 ml-60 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </AIProvider>
  );
}
