"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "@/components/RichTextEditor";
import TagSelector from "@/components/TagSelector";
import { Button } from "@/components/ui/button";
import { Loader2, Vault } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { fetchApi, handleApiError } from "@/lib/api-client";

export default function ThoughtDumpClient() {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // You can use availableTags later to build autocomplete in TagSelector if you want!
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const router = useRouter();

  // Fetch all existing tags on mount
  useEffect(() => {
    async function loadTags() {
      try {
        const response = await fetchApi("/api/tags");
        if (response?.data) {
          setAvailableTags(response.data);
        }
      } catch (error) {
        console.error("Failed to load tags:", error);
      }
    }
    loadTags();
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    
    setIsSubmitting(true);
    try {
      // The backend accepts a single tag_name currently (based on Zod schema)
      // So we just take the first tag added
      const payload = {
        thought: content,
        tag_name: tags.length > 0 ? tags[0] : null,
      };

      await fetchApi("/api/dump", {
        method: "POST",
        data: payload,
      });

      setContent("");
      setTags([]);
      toast.success("Thought saved securely");
      router.refresh();
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col p-4 md:p-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">Dump.</h1>
        <div className="flex items-center gap-4">
          <Link href="/vault">
            <Button variant="secondary" size="sm" className="gap-2 font-medium shadow-sm">
              <Vault className="w-4 h-4" />
              Vault
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="font-medium hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        <RichTextEditor content={content} onChange={setContent} />
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto sm:mt-0 pt-4 pb-20 sm:pb-0">
          <div className="flex-1">
            <TagSelector tags={tags} onChange={setTags} />
          </div>
          
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-10 h-12 shrink-0 shadow-md font-semibold text-base"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim() || content === "<p></p>"}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {isSubmitting ? "Saving..." : "Save Thought"}
          </Button>
        </div>
      </div>
    </main>
  );
}
