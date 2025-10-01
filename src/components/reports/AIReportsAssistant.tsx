"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  TrendingUp,
  Lightbulb,
  Target,
  BarChart3,
  Zap,
  Brain,
} from "lucide-react";

type ReportData = {
  kpis: {
    totalHours: number;
    totalShifts: number;
    completedShifts: number;
    cancelledShifts: number;
    completionRate: number;
    cancellationRate: number;
    avgHoursPerShift: number;
    avgHoursPerEmployee: number;
    efficiency: number;
    approvedTimeOffDays: number;
    pendingTimeOffRequests: number;
  };
  employees: Array<{
    name: string;
    position: string;
    hours: number;
    shifts: number;
  }>;
  dateRange: {
    from: string;
    to: string;
  };
};

interface AIReportsAssistantProps {
  reportData: ReportData;
}

export function AIReportsAssistant({ reportData }: AIReportsAssistantProps) {
  const [activeTab, setActiveTab] = React.useState("analyze");
  const [response, setResponse] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const handleAIRequest = async (action: "analyze" | "recommendations" | "insights" | "forecast") => {
    setLoading(true);
    setResponse("");
    setExpanded(true);

    try {
      const res = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reportData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      setResponse(data.result);
    } catch (error: any) {
      console.error("AI request error:", error);
      toast.error("AI Assistant Error", {
        description: error.message || "Failed to get response from AI assistant",
      });
      setResponse("Sorry, I encountered an error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl overflow-hidden">
      <CardHeader className="p-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-white">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center"
            >
              <Brain className="h-6 w-6" />
            </motion.div>
            <div>
              <div className="text-xl font-bold">AI-Powered Analytics</div>
              <div className="text-sm text-white/80 font-normal">
                Get intelligent insights from your workforce data
              </div>
            </div>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-xl rounded-xl p-1">
            <TabsTrigger
              value="analyze"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analyze</span>
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white rounded-lg"
            >
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Recommend</span>
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg"
            >
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger
              value="forecast"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Forecast</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="analyze" className="mt-0">
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 text-lg mb-2">
                        Comprehensive Performance Analysis
                      </h3>
                      <p className="text-sm text-blue-700 mb-4">
                        Get a detailed analysis of your workforce performance including KPIs, efficiency metrics,
                        completion rates, and employee productivity patterns.
                      </p>
                      <Button
                        onClick={() => handleAIRequest("analyze")}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                      >
                        {loading && activeTab === "analyze" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Analyze Performance
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-0">
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 text-lg mb-2">
                        Actionable Recommendations
                      </h3>
                      <p className="text-sm text-green-700 mb-4">
                        Receive prioritized, actionable recommendations to optimize scheduling, improve efficiency,
                        reduce costs, and enhance employee satisfaction.
                      </p>
                      <Button
                        onClick={() => handleAIRequest("recommendations")}
                        disabled={loading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                      >
                        {loading && activeTab === "recommendations" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Get Recommendations
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 text-lg mb-2">
                        Hidden Insights & Patterns
                      </h3>
                      <p className="text-sm text-purple-700 mb-4">
                        Discover hidden patterns, unusual trends, and valuable insights that might not be
                        immediately obvious from the raw data.
                      </p>
                      <Button
                        onClick={() => handleAIRequest("insights")}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                      >
                        {loading && activeTab === "insights" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        Discover Insights
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forecast" className="mt-0">
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-orange-900 text-lg mb-2">
                        Predictive Forecasting
                      </h3>
                      <p className="text-sm text-orange-700 mb-4">
                        Get future workforce predictions, expected trends, staffing needs, and capacity
                        planning recommendations based on historical data.
                      </p>
                      <Button
                        onClick={() => handleAIRequest("forecast")}
                        disabled={loading}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg"
                      >
                        {loading && activeTab === "forecast" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <TrendingUp className="h-4 w-4 mr-2" />
                        )}
                        Generate Forecast
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* AI Response */}
        <AnimatePresence>
          {(response || loading) && expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-slate-800">AI Analysis Results</span>
                    </div>
                    {!loading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(false)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        Close
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[400px] p-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                      <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                      <p className="text-slate-600 font-medium">Analyzing your data...</p>
                      <p className="text-sm text-slate-500 mt-2">This may take a few moments</p>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {response}
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              <span>Powered by OpenAI GPT-4</span>
            </div>
            <div className="text-slate-400">Real-time AI analysis</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
