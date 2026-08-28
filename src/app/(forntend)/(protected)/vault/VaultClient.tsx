"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function VaultClient({ initialThoughts }: { initialThoughts: any[] }) {
  const [thoughts, setThoughts] = useState(initialThoughts);
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    // using browser confirm is standard and okay for simple apps, otherwise we'd use a shadcn dialog
    if (confirm("Are you sure you want to delete this thought?")) {
      setThoughts(thoughts.filter(t => t._id !== id));
      toast.success("Thought deleted");
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8 pb-4 border-b">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Vault</h1>
        </div>
        <Button variant="ghost" size="sm" className="font-medium hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
          Log out
        </Button>
      </header>

      {thoughts.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-secondary/30 rounded-xl border border-dashed">
          <p className="text-xl font-medium">Your vault is empty.</p>
          <Link href="/" className="text-primary hover:underline font-semibold mt-4 inline-block">Start dumping thoughts</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {thoughts.map((thought) => (
            <Card key={thought._id} className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="bg-secondary/20 py-3 px-6 flex flex-row items-center justify-between">
                <time className="text-sm text-muted-foreground font-medium">
                  {new Date(thought.createdAt).toLocaleString()}
                </time>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(thought._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  className="prose dark:prose-invert max-w-none tiptap-content text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: thought.contentHtml }} 
                />
              </CardContent>
              {thought.tags && thought.tags.length > 0 && (
                <CardFooter className="px-6 py-4 bg-secondary/10 border-t">
                  <div className="flex flex-wrap gap-2">
                    {thought.tags.map((tag: string) => (
                      <span key={tag} className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
