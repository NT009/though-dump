"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Brain, Home, LogOut, Vault } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const navItems = [
    { name: "Dump", href: "/", icon: Home },
    { name: "Vault", href: "/vault", icon: Vault },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-neutral-950">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-6">
        <Link href="/" className="flex items-center gap-3 px-2 mb-10 transition-opacity hover:opacity-80 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md">
            <Brain className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Dump.</span>
        </Link>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 h-11 ${
                    isActive ? "font-semibold shadow-sm" : "text-muted-foreground font-medium hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-11"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-white dark:bg-neutral-900 sticky top-0 z-10">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 cursor-pointer">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">Dump.</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/vault">
              <Button variant="ghost" size="icon" className={pathname === "/vault" ? "bg-secondary" : ""}>
                <Vault className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
