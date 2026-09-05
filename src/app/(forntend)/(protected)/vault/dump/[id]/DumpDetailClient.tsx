"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { fetchApi, handleApiError } from "@/lib/api-client";
import { ArrowLeft, Calendar, Clock, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DumpDetailClient({ id }: { id: string }) {
  const [dump, setDump] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDump() {
      try {
        const data = await fetchApi(`/api/dump/${id}`);
        setDump(data.dump);
      } catch (error) {
        handleApiError(error, "Failed to load thought");
        router.push("/vault");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDump();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this thought?")) return;
    
    try {
      await fetchApi(`/api/dump/${id}`, { method: "DELETE" });
      toast.success("Thought deleted successfully");
      router.back();
    } catch (error) {
      handleApiError(error, "Failed to delete thought");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-muted-foreground animate-pulse">Loading thought...</div>;
  }

  if (!dump) return null;

  const dateObj = new Date(dump.created_at);
  const formattedDate = dateObj.toLocaleDateString(undefined, { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, { 
    hour: 'numeric', minute: '2-digit' 
  });

  return (
    <div className="w-full mt-2 md:mt-4">
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <Card className="shadow-md border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <CardHeader className="bg-slate-50/80 dark:bg-neutral-900/50 border-b border-slate-100 dark:border-neutral-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formattedTime}
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full sm:w-auto flex items-center gap-2 shadow-sm"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete Thought
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 md:p-8">
          <div 
            className="prose prose-slate dark:prose-invert max-w-none text-lg leading-relaxed tiptap-content"
            dangerouslySetInnerHTML={{ __html: dump.thought }} 
          />
        </CardContent>

        {dump.tag && dump.tag.name && (
          <CardFooter className="px-6 md:px-8 py-5 bg-slate-50/50 dark:bg-neutral-900/30 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">Categorized in:</span>
              <span className="text-sm font-semibold text-primary/90 bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                #{dump.tag.name}
              </span>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
