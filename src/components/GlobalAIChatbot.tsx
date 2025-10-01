"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Loader2,
  Minimize2,
  Maximize2,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type QuickAction = {
  icon: React.ReactNode;
  label: string;
  prompt: string;
};

export function GlobalAIChatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI scheduling assistant. I can help you create schedules, find employees, analyze performance, and answer questions about your workforce. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Generate next week's schedule",
      prompt: "Generate an optimized schedule for next week based on employee availability and business needs",
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Who has least overtime?",
      prompt: "Show me which employees have worked the least overtime this month",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Find coverage gaps",
      prompt: "Analyze my current schedule and identify any coverage gaps or understaffed periods",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Performance insights",
      prompt: "Give me performance insights and recommendations for my team",
    },
  ];

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Here you would call your AI API endpoint
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateContextualResponse(input),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Failed to get AI response");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSendMessage(), 100);
  };

  const generateContextualResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("schedule") && lowerQuery.includes("next week")) {
      return "I can help you generate next week's schedule! Based on your team's availability and past patterns, I recommend:\n\n1. Assigning Sarah to Monday-Wednesday morning shifts (she has high availability)\n2. Scheduling Mike for evening shifts Tuesday-Thursday\n3. Keeping weekend shifts open for your part-time team\n\nWould you like me to create this schedule automatically?";
    }

    if (lowerQuery.includes("overtime") || lowerQuery.includes("least")) {
      return "Based on current data:\n\n📊 Employees with least overtime:\n1. Emily Watson - 2.5 hours\n2. David Chen - 3.2 hours\n3. Lisa Park - 4.1 hours\n\nThese employees have capacity for additional hours if needed. Would you like to assign them extra shifts?";
    }

    if (lowerQuery.includes("coverage") || lowerQuery.includes("gap")) {
      return "I've analyzed your schedule and found these coverage gaps:\n\n⚠️ Coverage Issues:\n• Thursday 2-4 PM: Only 1 employee scheduled (need 3)\n• Saturday morning: No manager on duty\n• Sunday evening: Below minimum staffing\n\nI can suggest employees to fill these gaps. Would you like recommendations?";
    }

    if (lowerQuery.includes("performance") || lowerQuery.includes("insight")) {
      return "📈 Key Performance Insights:\n\n✅ Strengths:\n• 94% on-time shift starts\n• Low cancellation rate (2.3%)\n• High employee satisfaction\n\n⚠️ Areas to Improve:\n• Weekend coverage inconsistent\n• 3 employees approaching overtime limits\n• Consider cross-training for flexibility\n\nWant detailed recommendations?";
    }

    return "I can help you with:\n• Creating and optimizing schedules\n• Finding available employees\n• Analyzing performance and trends\n• Identifying coverage gaps\n• Shift swap recommendations\n\nWhat would you like to know more about?";
  };

  React.useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    }
  }, [messages]);

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={() => setIsOpen(true)}
                className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 relative"
              >
                <MessageSquare className="h-7 w-7 text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? "auto" : undefined,
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col
              ${isMinimized ? '' : 'h-[85vh] max-h-[600px]'}
              bottom-4 right-4 w-[calc(100vw-2rem)]
              sm:bottom-6 sm:right-6 sm:w-[400px]
              lg:w-[420px]
            `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base sm:text-lg truncate">AI Assistant</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-white/80">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-hidden bg-slate-50">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4" ref={scrollRef}>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 sm:gap-3 ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                              AI
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                              : "bg-white border border-slate-200 text-slate-800"
                          }`}
                        >
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`text-xs mt-1 sm:mt-2 ${
                              message.role === "user" ? "text-blue-100" : "text-slate-500"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        {message.role === "user" && (
                          <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                            <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                              You
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </motion.div>
                    ))}

                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 sm:gap-3"
                      >
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                            AI
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 sm:px-4 sm:py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-xs sm:text-sm text-slate-600">Thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {/* Scroll anchor */}
                    <div ref={scrollRef} />
                  </div>
                  </ScrollArea>
                </div>

                {/* Quick Actions */}
                {messages.length === 1 && (
                  <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-600 mb-2 sm:mb-3 flex items-center gap-2">
                      <Lightbulb className="h-3 w-3" />
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickActions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickAction(action.prompt)}
                          className="text-left h-auto py-2 px-2 sm:px-3 justify-start text-xs hover:bg-blue-50 hover:border-blue-300"
                        >
                          <span className="mr-1 sm:mr-2 flex-shrink-0">{action.icon}</span>
                          <span className="truncate">{action.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex-shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything..."
                      disabled={loading}
                      className="flex-1 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                    <Button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl px-3 sm:px-4 flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <p className="text-xs text-slate-400 mt-2 text-center hidden sm:block">
                    Powered by AI • Always learning
                  </p>
                </div>
              </>
            )}

            {isMinimized && (
              <div className="p-3 sm:p-4 bg-white flex-shrink-0">
                <p className="text-xs sm:text-sm text-slate-600 text-center">Chat minimized - Click to expand</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
