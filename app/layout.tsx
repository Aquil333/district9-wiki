import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { NavigationProvider } from "@/components/NavigationProvider";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "District 9 RP - Wiki",
  description: "Официальная википедия игрового проекта District 9 RP",
  keywords: "GTA 5 RP, District 9, RAGE MP, roleplay, wiki",
};

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  return categories;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <html lang="ru">
      <body className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a]">
        <NavigationProvider categories={categories}>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar categories={categories} />
            
            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64">
              <Header />
              <main className="p-4 lg:p-8">
                <div className="mx-auto max-w-7xl">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </NavigationProvider>
        
        {/* Background Effects */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" />
        </div>
      </body>
    </html>
  );
}