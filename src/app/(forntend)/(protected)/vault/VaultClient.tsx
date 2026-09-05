"use client";

import { Button } from "@/components/ui/button";
import { fetchApi, handleApiError } from "@/lib/api-client";
import { Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VaultClient() {
  const [summary, setSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSummary() {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const data = await fetchApi(`/api/dump/summary?timezone=${tz}`);
        setSummary(data.summary || []);
      } catch (error) {
        handleApiError(error, "Failed to load summary");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSummary();
  }, []);

  return (
    <div className="w-full mt-2 md:mt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-1">
            Your Vault
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Your daily dump activity summary.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 text-muted-foreground animate-pulse">
          Loading summary...
        </div>
      ) : summary.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-32 text-muted-foreground bg-slate-50/50 dark:bg-neutral-900/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-neutral-800">
          <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your vault is empty</h3>
          <p className="max-w-sm mb-6">You haven't dumped any thoughts yet. Head over to the home page to start writing.</p>
          <Link href="/">
            <Button className="rounded-full px-8 shadow-sm">Start dumping thoughts</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 dark:bg-neutral-900/50 border-b border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Thoughts Dumped</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                {summary.map((item, index) => {
                  const dateObj = new Date(item.date);
                  const formattedDate = dateObj.toLocaleDateString(undefined, { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC'
                  });

                  return (
                    <tr 
                      key={index} 
                      onClick={() => router.push(`/vault/${item.date}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-neutral-900/30 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">
                            <Calendar className="w-4 h-4" />
                          </div>
                          {formattedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            {item.count}
                          </span>
                        </div>
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
