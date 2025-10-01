"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabaseClient";
import { useOrg } from "@/components/providers/OrgProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Users2,
  CalendarCheck,
  Clock,
  FileText,
  Sparkles,
  Loader2,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type SearchResult = {
  id: string;
  type: "employee" | "shift" | "timeoff" | "schedule";
  title: string;
  subtitle: string;
  link: string;
  icon: any;
  metadata?: string;
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") || "";

  const supabase = React.useMemo(() => createClient(), []);
  const { orgId } = useOrg();

  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchPerformed, setSearchPerformed] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");

  const filters = [
    { id: "all", label: "All Results", icon: Search },
    { id: "employee", label: "Employees", icon: Users2 },
    { id: "shift", label: "Shifts", icon: CalendarCheck },
    { id: "timeoff", label: "Time Off", icon: Clock },
  ];

  // Perform search
  const performSearch = React.useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim() || !orgId) {
        setResults([]);
        return;
      }

      setLoading(true);
      setSearchPerformed(true);

      try {
        const lowerQuery = searchQuery.toLowerCase();
        const allResults: SearchResult[] = [];

        // Search employees
        const { data: employees } = await supabase
          .from("employees")
          .select("id, full_name, positions:position_id(name)")
          .eq("org_id", orgId)
          .ilike("full_name", `%${searchQuery}%`)
          .limit(10);

        if (employees) {
          employees.forEach((emp: any) => {
            allResults.push({
              id: emp.id,
              type: "employee",
              title: emp.full_name,
              subtitle: emp.positions?.name || "No position",
              link: `/employees?id=${emp.id}`,
              icon: Users2,
              metadata: "Employee",
            });
          });
        }

        // Search shifts by date or employee name
        const { data: shifts } = await supabase
          .from("shifts")
          .select(
            `
            id,
            starts_at,
            ends_at,
            employees:employee_id(full_name),
            positions:position_id(name)
          `
          )
          .eq("org_id", orgId)
          .order("starts_at", { ascending: false })
          .limit(10);

        if (shifts) {
          const filteredShifts = shifts.filter((shift: any) => {
            const employeeName = shift.employees?.full_name?.toLowerCase() || "";
            const positionName = shift.positions?.name?.toLowerCase() || "";
            const dateStr = new Date(shift.starts_at).toLocaleDateString().toLowerCase();
            return (
              employeeName.includes(lowerQuery) ||
              positionName.includes(lowerQuery) ||
              dateStr.includes(lowerQuery)
            );
          });

          filteredShifts.forEach((shift: any) => {
            const date = new Date(shift.starts_at).toLocaleDateString();
            const time = new Date(shift.starts_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            allResults.push({
              id: shift.id,
              type: "shift",
              title: `${shift.employees?.full_name || "Open Shift"} - ${date}`,
              subtitle: `${time} • ${shift.positions?.name || "No position"}`,
              link: `/schedule`,
              icon: CalendarCheck,
              metadata: "Shift",
            });
          });
        }

        // Search time off requests
        const { data: timeoffs } = await supabase
          .from("time_off")
          .select(
            `
            id,
            type,
            starts_at,
            ends_at,
            status,
            employees:employee_id(full_name)
          `
          )
          .eq("org_id", orgId)
          .limit(10);

        if (timeoffs) {
          const filteredTimeoffs = timeoffs.filter((to: any) => {
            const employeeName = to.employees?.full_name?.toLowerCase() || "";
            const type = to.type?.toLowerCase() || "";
            return employeeName.includes(lowerQuery) || type.includes(lowerQuery);
          });

          filteredTimeoffs.forEach((to: any) => {
            allResults.push({
              id: to.id,
              type: "timeoff",
              title: `${to.employees?.full_name} - ${to.type}`,
              subtitle: `${new Date(to.starts_at).toLocaleDateString()} - ${new Date(
                to.ends_at
              ).toLocaleDateString()}`,
              link: `/time-off`,
              icon: Clock,
              metadata: to.status,
            });
          });
        }

        setResults(allResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    },
    [orgId, supabase]
  );

  // Auto-search on mount if query exists
  React.useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const filteredResults =
    selectedFilter === "all"
      ? results
      : results.filter((r) => r.type === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Search</h1>
                <p className="text-sm text-slate-600">
                  Find employees, shifts, time off, and more
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for employees, shifts, dates..."
                className="pl-12 pr-24 h-14 text-lg bg-white/90 border-slate-300 focus:border-blue-500 focus:ring-blue-500 rounded-2xl"
                autoFocus
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.map((filter) => (
                <Button
                  key={filter.id}
                  variant={selectedFilter === filter.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`gap-2 rounded-xl transition-all ${
                    selectedFilter === filter.id
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-white/80 hover:bg-slate-100"
                  }`}
                >
                  <filter.icon className="h-4 w-4" />
                  {filter.label}
                  {selectedFilter === filter.id && results.length > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-white/20">
                      {filteredResults.length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-slate-600 font-medium">Searching...</p>
              </div>
            </motion.div>
          ) : !searchPerformed ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-12">
                <Sparkles className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Start Searching
                </h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  Enter a search term above to find employees, shifts, time off requests, and
                  more across your organization.
                </p>
              </div>
            </motion.div>
          ) : filteredResults.length === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-lg p-12">
                <Search className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">No Results Found</h2>
                <p className="text-slate-600 max-w-md mx-auto mb-6">
                  We couldn't find anything matching "{query}". Try searching with different
                  keywords or check your spelling.
                </p>
                <Button
                  onClick={() => {
                    setQuery("");
                    setSearchPerformed(false);
                    setResults([]);
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Search
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {filteredResults.length} {filteredResults.length === 1 ? "result" : "results"}{" "}
                  found
                </h2>
              </div>

              {filteredResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Link href={result.link}>
                    <div className="group bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors flex-shrink-0">
                          <result.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {result.title}
                          </h3>
                          <p className="text-sm text-slate-600 truncate">{result.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {result.metadata && (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-700 capitalize"
                            >
                              {result.metadata}
                            </Badge>
                          )}
                          <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
