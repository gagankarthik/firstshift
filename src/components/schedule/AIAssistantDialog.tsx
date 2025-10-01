"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Sparkles, Loader2, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import type { ScheduleData } from "@/lib/openai";

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleData: ScheduleData;
}

export function AIAssistantDialog({
  open,
  onOpenChange,
  scheduleData,
}: AIAssistantDialogProps) {
  const [activeTab, setActiveTab] = React.useState("ask");
  const [prompt, setPrompt] = React.useState("");
  const [response, setResponse] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleAIRequest = async (action: "suggest" | "optimize" | "analyze-coverage", customPrompt?: string) => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/ai/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          scheduleData,
          prompt: customPrompt || prompt,
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

  const handleAsk = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a question or request");
      return;
    }
    handleAIRequest("suggest", prompt);
  };

  const quickActions = [
    {
      label: "Fill open shifts",
      prompt: "Suggest which employees should fill the open shifts based on their availability and workload.",
    },
    {
      label: "Balance workload",
      prompt: "Analyze the current schedule and suggest how to balance the workload more evenly across all employees.",
    },
    {
      label: "Find conflicts",
      prompt: "Identify any scheduling conflicts, availability issues, or potential problems in the current schedule.",
    },
    {
      label: "Coverage gaps",
      prompt: "Identify any time periods with inadequate coverage and suggest solutions.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">AI Scheduling Assistant</DialogTitle>
              <DialogDescription>
                Get intelligent suggestions to optimize your schedule
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ask" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Ask AI
            </TabsTrigger>
            <TabsTrigger value="optimize" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="analyze" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Analyze
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 mt-4">
            <TabsContent value="ask" className="h-full space-y-4 mt-0">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ask a question or make a request:</label>
                <Textarea
                  placeholder="E.g., 'Which employees are best suited for the morning shifts this week?' or 'Suggest optimal shift assignments for Tuesday'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Quick actions:</label>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPrompt(action.prompt);
                        handleAIRequest("suggest", action.prompt);
                      }}
                      disabled={loading}
                      className="justify-start text-left h-auto py-2 px-3"
                    >
                      <Lightbulb className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {!loading && !response && (
                <Button onClick={handleAsk} disabled={loading || !prompt.trim()} className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Suggestions
                </Button>
              )}

              {(response || loading) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Response:</label>
                  <ScrollArea className="h-[300px] rounded-lg border bg-slate-50 p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
                          <p className="text-sm text-slate-600">Analyzing your schedule...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-slate-700">{response}</div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="optimize" className="h-full space-y-4 mt-0">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Schedule Optimization
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  AI will analyze your current schedule and provide recommendations to:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Fill open shifts efficiently</li>
                  <li>Balance workload across employees</li>
                  <li>Improve shift assignments</li>
                  <li>Maximize coverage and minimize gaps</li>
                </ul>
              </div>

              <Button
                onClick={() => handleAIRequest("optimize")}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Optimize Schedule
                  </>
                )}
              </Button>

              {(response || loading) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Optimization Suggestions:</label>
                  <ScrollArea className="h-[300px] rounded-lg border bg-slate-50 p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                          <p className="text-sm text-slate-600">Optimizing your schedule...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-slate-700">{response}</div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analyze" className="h-full space-y-4 mt-0">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Coverage Analysis
                </h3>
                <p className="text-sm text-orange-700 mb-3">
                  AI will analyze your schedule for:
                </p>
                <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
                  <li>Time periods with insufficient coverage</li>
                  <li>Days with staffing imbalances</li>
                  <li>Position-specific coverage issues</li>
                  <li>Location coverage distribution</li>
                </ul>
              </div>

              <Button
                onClick={() => handleAIRequest("analyze-coverage")}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Analyze Coverage
                  </>
                )}
              </Button>

              {(response || loading) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coverage Analysis:</label>
                  <ScrollArea className="h-[300px] rounded-lg border bg-slate-50 p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-3">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-600" />
                          <p className="text-sm text-slate-600">Analyzing coverage gaps...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-slate-700">{response}</div>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-slate-500">Powered by OpenAI GPT-4</p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
