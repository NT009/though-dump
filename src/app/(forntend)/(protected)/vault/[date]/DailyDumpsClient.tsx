"use client";

import { fetchApi, handleApiError } from "@/lib/api-client";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DailyDumpsClient({ date }: { date: string }) {
  const [dumps, setDumps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Format date for display
  const displayDate = new Date(date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

  useEffect(() => {
    async function fetchDumps() {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const data = await fetchApi(`/api/dump?date=${date}&timezone=${tz}`);
        setDumps(data.dumps || []);
      } catch (error) {
        handleApiError(error, "Failed to load dumps");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDumps();
  }, [date]);

  return (
    <div className="w-full mt-2 md:mt-4">
      <Link href="/vault" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Vault
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
            {displayDate}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Thoughts dumped on this day.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground animate-pulse">
          Loading thoughts...
        </div>
      ) : dumps.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-32 text-muted-foreground bg-slate-50/50 dark:bg-neutral-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-800">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No thoughts found</h3>
          <p className="max-w-sm">There are no dumps recorded for this date.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 dark:bg-neutral-900/50 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap w-32">Time</th>
                  <th className="px-6 py-4 whitespace-nowrap min-w-[300px]">Thought Preview</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap w-64">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                {dumps.map((dump) => {
                  const timeFormatted = new Date(dump.created_at).toLocaleTimeString(undefined, { 
                    hour: 'numeric',
                    minute: '2-digit'
                  });

                  // Strip HTML tags for preview text
                  const strippedThought = dump.thought.replace(/(<([^>]+)>)/gi, "");

                  return (
                    <tr 
                      key={dump._id} 
                      onClick={() => router.push(`/vault/dump/${dump._id}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                          {timeFormatted}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 dark:text-slate-100 line-clamp-2">
                          {strippedThought}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {dump.tags && dump.tags.length > 0 ? (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            {dump.tags.slice(0, 2).map((tag: any) => (
                              <span key={tag._id} className="inline-flex text-xs font-semibold text-primary/80 bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                                #{tag.name}
                              </span>
                            ))}
                            {dump.tags.length > 2 && (
                              <span className="inline-flex text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded-md border border-slate-200 dark:border-neutral-700">
                                +{dump.tags.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Uncategorized</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
