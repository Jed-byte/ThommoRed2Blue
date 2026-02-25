import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "flo";
  content: string;
  suggestions?: string[];
  timestamp: Date;
}

interface FloResponse {
  message: string;
  suggestions?: string[];
  redHeadIndicators?: string[];
  blueHeadTechniques?: string[];
  urgencyLevel?: string;
}

// Error boundary wrapper component
function ChatErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // DISABLED: Global error listeners to prevent infinite loops and crashes
  // useEffect(() => {
  //   const handleError = (event: ErrorEvent) => {
  //     setHasError(true);
  //     setError(new Error(event.message));
  //   };

  //   const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  //     setHasError(true);
  //     setError(new Error(event.reason?.toString() || 'Promise rejection'));
  //   };

  //   window.addEventListener('error', handleError);
  //   window.addEventListener('unhandledrejection', handleUnhandledRejection);

  //   return () => {
  //     window.removeEventListener('error', handleError);
  //     window.removeEventListener('unhandledRejection', handleUnhandledRejection);
  //   };
  // }, []);

  if (hasError) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-white dark:bg-gray-950 border border-red-200">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Temporarily Unavailable</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              I'm having trouble loading right now. Let me try to restart the chat.
            </p>
            <Button 
              onClick={() => {
                setHasError(false);
                setError(null);
                window.location.reload();
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Restart Chat
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}

export function BulletproofFloChat({ isInlineWidget = false }: { isInlineWidget?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [componentReady, setComponentReady] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Component initialization - simplified
  useEffect(() => {
    const timer = setTimeout(() => setComponentReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Simplified auto-scroll without complex observers
  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      const container = chatContainerRef.current;
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }, [messages]);

  // Cleanup only - no dependencies to prevent infinite loops
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const messageId = Date.now().toString();
    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: messageText.trim(),
      timestamp: new Date()
    };

    // Immediately add user message and clear input
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Create new abort controller for this request
    const controller = new AbortController();
    setAbortController(controller);

    try {
      console.log(`[FLOG-CHAT] Sending message: "${messageText.substring(0, 50)}..."`);
      
      const response = await fetch("/api/landing-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText.trim() }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: FloResponse = await response.json();
      console.log(`[FLOG-CHAT] Received response successfully`);

      // Add Flo's response
      const floMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "flo",
        content: data.message,
        suggestions: data.suggestions || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, floMessage]);

    } catch (error: any) {
      console.error("[FLOG-CHAT] Error:", error);

      // Don't show error if request was aborted
      if (error.name === 'AbortError') {
        return;
      }

      // Add error message that's helpful to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "flo",
        content: error.message?.includes('timeout') 
          ? "I'm taking a moment to think. Try asking me about box breathing, control circles, or pre-game nerves - I can help you with those right away!"
          : "I'm here to help with your mental game. Ask me about handling pressure, staying focused, or specific techniques like box breathing and control circles.",
        suggestions: ["Box Breathing", "Control Circles", "Pre-game Nerves", "Focus Techniques"],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setAbortController(null);
      
      // Simple refocus without setTimeout to prevent memory leaks
      if (inputRef.current && !inputRef.current.disabled) {
        inputRef.current.focus();
      }
    }
  }, [isLoading]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
    }
  }, [inputValue, sendMessage, isLoading]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (!isLoading) {
      sendMessage(`Tell me about ${suggestion.toLowerCase()}`);
    }
  }, [sendMessage, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
    if (e.key === "Escape") {
      if (abortController) {
        abortController.abort();
      }
    }
  }, [handleSubmit, abortController]);

  // Show loading state while component initializes
  if (!componentReady) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400">Loading Flo...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <ChatErrorBoundary>
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-red-50 dark:from-blue-950/20 dark:to-red-950/20">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Chat with Flo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Your Red2Blue mental performance coach</p>
          </div>
        </div>

        {/* Messages Container */}
        <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Hi! I'm Flo, your mental performance coach.</p>
            <p className="mt-2">Ask me about handling pressure, staying focused, or any mental game challenge.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-center mt-4 max-w-md mx-auto">
              {[
                "I missed a short putt and got frustrated. How do I recover?",
                "I'm feeling nervous before my next round. Help with pre-round anxiety?", 
                "How do I stay focused after a bad shot?",
                "What's the best breathing technique for pressure putts?",
                "Tell me about control circles and managing distractions",
                "How can I build confidence on the first tee?"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(suggestion)}
                  className="text-xs h-auto p-3 text-left leading-relaxed hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-3 shadow-sm",
                message.role === "user"
                  ? "bg-blue-600 text-white ml-4"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white mr-4"
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
              
              {/* Suggestions for Flo messages */}
              {message.role === "flo" && message.suggestions && message.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {message.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-7 px-2 hover:bg-white/20 dark:hover:bg-gray-700"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 max-w-[80%] mr-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Flo is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Flo about mental game techniques..."
            maxLength={500}
            disabled={isLoading}
            className="flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
            autoFocus
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="default"
            className="px-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send • ESC to cancel • {500 - inputValue.length} characters left
        </p>
      </form>
      </Card>
    </ChatErrorBoundary>
  );
}