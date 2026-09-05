"use client";

import RichTextEditor from "@/components/RichTextEditor";
import TagSelector from "@/components/TagSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchApi, handleApiError } from "@/lib/api-client";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ThoughtDumpClient() {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const router = useRouter();

  const loadTags = async () => {
    try {
      const response = await fetchApi("/api/tags");
      if (response?.data) {
        setAvailableTags(response.data);
      }
    } catch (error) {
      console.error("Failed to load tags:", error);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") return;
    
    setIsSubmitting(true);
    try {
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
      await loadTags(); // Re-fetch the tags to include any new ones created!
      toast.success("Thought saved securely");
      router.refresh();
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full mt-2 md:mt-4 pb-32 md:pb-0">
      <div className="mb-4 md:mb-6 text-center md:text-left">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
          What's on your mind?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
          Dump your thoughts, ideas, and tasks securely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Editor Section */}
        <div className="md:col-span-2">
          <RichTextEditor content={content} onChange={setContent} />
        </div>
        
        {/* Action Section */}
        <div className="md:col-span-1">
          <Card className="shadow-lg border-slate-200/60 dark:border-neutral-800/60 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl overflow-visible">
            <CardContent className="p-4 sm:p-6 flex flex-col gap-6">
              {/* Desktop Button */}
              <div className="hidden md:block w-full">
                <Button 
                  size="lg" 
                  className="w-full h-12 shadow-md font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !content.trim() || content === "<p></p>"}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Saving..." : "Dump Thought"}
                </Button>
              </div>

              <div className="w-full">
                <label className="text-sm font-semibold mb-2 block text-slate-700 dark:text-slate-300">
                  Tags
                </label>
                <TagSelector tags={tags} availableTags={availableTags} onChange={setTags} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Floating Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-neutral-800 z-[60] pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button 
          size="lg" 
          className="w-full h-12 shadow-md font-semibold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim() || content === "<p></p>"}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {isSubmitting ? "Saving..." : "Dump Thought"}
        </Button>
      </div>
    </div>
  );
}
