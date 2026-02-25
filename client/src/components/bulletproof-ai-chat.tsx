import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Users, Send, Loader2, Crown, AlertTriangle, X, RefreshCw } from "lucide-react";

interface ChatLimitations {
  chatLimit: number;
  chatsUsed: number;
  hasAccess: boolean;
  canChat: boolean;
  subscriptionStatus: "free" | "premium_included" | "ultimate_included" | "expired";
  renewalDate?: Date;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    urgencyLevel?: string;
    blueHeadTechniques?: string[];
  };
}

interface ChatSession {
  id: number;
  messages: Message[];
}

interface BulletproofAIChatProps {
  userId: number;
}

export function BulletproofAIChat({ userId }: BulletproofAIChatProps) {
  // Separate state for input to prevent conflicts
  const [inputText, setInputText] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Refs for DOM manipulation
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputElementRef = useRef<HTMLInputElement>(null);
  const currentRequestRef = useRef<AbortController | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Data fetching with proper error handling
  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: [`/api/chat/sessions/${userId}`],
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const { data: limitations, isLoading: limitationsLoading, error: limitationsError } = useQuery<ChatLimitations>({
    queryKey: [`/api/chat/limitations/${userId}`],
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const currentSession: ChatSession | null = sessions?.[0] || null;
  const messages: Message[] = currentSession?.messages || [];

  // Scroll management with proper detection
  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current && isScrolledToBottom) {
      requestAnimationFrame(() => {
        messageEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      });
    }
  }, [isScrolledToBottom]);

  // Scroll detection for auto-scroll behavior
  const handleScroll = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!scrollContainer) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
    setIsScrolledToBottom(isAtBottom);
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, scrollToBottom]);

  // Focus management
  useEffect(() => {
    if (inputElementRef.current && !mutation.isPending) {
      inputElementRef.current.focus();
    }
  }, []);

  // Clear errors when user types
  useEffect(() => {
    if (connectionError && inputText.length > 0) {
      setConnectionError(null);
    }
  }, [inputText, connectionError]);

  // Optimized mutation with proper error handling
  const mutation = useMutation({
    mutationFn: async (data: { message: string; sessionId?: number }) => {
      // Cancel any existing request
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }

      const controller = new AbortController();
      currentRequestRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            message: data.message,
            sessionId: data.sessionId || currentSessionId,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        return response.json();
      } finally {
        currentRequestRef.current = null;
      }
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.session.id);
      queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/chat/limitations/${userId}`] });
      setInputText("");
      setConnectionError(null);
      
      // Ensure we scroll to bottom after successful message
      setTimeout(() => {
        setIsScrolledToBottom(true);
        scrollToBottom();
      }, 100);
    },
    onError: (error: any) => {
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Chat error:', error);
      setConnectionError(error.message || 'Failed to send message');

      if (error.message?.includes("Chat limit reached") || error.message?.includes("403")) {
        toast({
          title: "FLO Chat Limit Reached",
          description: "You've reached your monthly chat limit. Upgrade to continue chatting with Flo.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Chat Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Send message handler with validation
  const sendMessage = useCallback(() => {
    const messageText = inputText.trim();
    
    if (!messageText || mutation.isPending) return;
    
    // Check if user can still chat
    if (limitations && !limitations.canChat) {
      toast({
        title: "FLO Chat Limit Reached",
        description: "You've reached your monthly chat limit. Upgrade to continue chatting with Flo.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate({
      message: messageText,
      sessionId: currentSessionId || undefined,
    });
  }, [inputText, mutation, limitations, currentSessionId, toast]);

  // Cancel request handler
  const cancelRequest = useCallback(() => {
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }
  }, []);

  // Form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  }, [sendMessage]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === "Escape" && mutation.isPending) {
      e.preventDefault();
      cancelRequest();
    }
  }, [sendMessage, mutation.isPending, cancelRequest]);

  // Input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  }, []);

  // Refresh handler
  const refreshChat = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions/${userId}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/chat/limitations/${userId}`] });
    setConnectionError(null);
  }, [queryClient, userId]);

  // Utility functions
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (sessionsLoading || limitationsLoading) {
    return (
      <Card className="shadow-sm border-gray-100 h-96 flex flex-col">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <CardTitle className="font-semibold text-gray-900">Chat with Flo</CardTitle>
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (sessionsError || limitationsError) {
    return (
      <Card className="shadow-sm border-gray-100 h-96 flex flex-col">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="font-semibold text-gray-900">Chat with Flo</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">Unable to load chat</p>
            <Button onClick={refreshChat} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-gray-100 h-96 flex flex-col">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <CardTitle className="font-semibold text-gray-900">Chat with Flo</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-500">Online</span>
                {limitations && (
                  <Badge variant="secondary" className="text-xs">
                    {limitations.chatLimit === -1 
                      ? "Unlimited" 
                      : `${limitations.chatsUsed}/${limitations.chatLimit} chats`
                    }
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshChat}
            className="text-gray-400 hover:text-gray-600"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
        
        {/* Connection error display */}
        {connectionError && (
          <Alert className="mt-3 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 flex items-center justify-between">
              <span>{connectionError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConnectionError(null)}
                className="ml-2 p-1 h-6 text-red-600"
              >
                <X size={12} />
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Chat limitations warning */}
        {limitations && limitations.subscriptionStatus === "free" && limitations.chatsUsed >= limitations.chatLimit - 1 && (
          <Alert className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You're close to your monthly limit. <a href="/checkout?tier=premium" className="text-blue-600 underline">Upgrade now</a> for unlimited FLO chats.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Chat limit reached */}
        {limitations && !limitations.canChat && (
          <Alert className="mt-3 bg-red-50 border-red-200">
            <Crown className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong>Chat limit reached!</strong> Upgrade to Premium ($590) or Ultimate ($2290) for unlimited FLO access.
              <div className="mt-2 space-x-2">
                <Button size="sm" asChild>
                  <a href="/checkout?tier=premium">Upgrade to Premium</a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href="/checkout?tier=ultimate">Get Ultimate</a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      
      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full p-4"
          onScrollCapture={handleScroll}
        >
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="text-blue-600" size={24} />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Welcome to Red2Blue Coaching</h3>
                <p className="text-sm text-gray-600">
                  Hi! I'm Flo, your AI mental performance coach. How can I help you shift from Red Head to Blue Head today?
                </p>
              </div>
            ) : (
              messages.map((msg: Message, index: number) => (
                <div
                  key={`${msg.role}-${index}-${msg.timestamp}`}
                  className={`flex items-start space-x-3 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">F</span>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-2xl p-4 max-w-xs ${
                      msg.role === "user"
                        ? "bg-gray-100 rounded-tr-md"
                        : "bg-blue-50 rounded-tl-md border border-blue-200"
                    }`}
                  >
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{msg.content}</p>
                    
                    {/* Show coaching metadata */}
                    {msg.metadata && (
                      <div className="mt-3 space-y-2">
                        {msg.metadata.urgencyLevel && msg.metadata.urgencyLevel !== "low" && (
                          <Badge className={getUrgencyColor(msg.metadata.urgencyLevel)}>
                            {msg.metadata.urgencyLevel} priority
                          </Badge>
                        )}
                        
                        {msg.metadata.blueHeadTechniques && msg.metadata.blueHeadTechniques.length > 0 && (
                          <div className="text-xs text-blue-600">
                            💡 Suggested: {msg.metadata.blueHeadTechniques.join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <span className="text-xs text-gray-500 mt-2 block">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {mutation.isPending && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">F</span>
                </div>
                <div className="rounded-2xl p-4 max-w-xs bg-blue-50 rounded-tl-md border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-700">Flo is thinking...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelRequest}
                      className="ml-2 p-1 h-6 text-xs hover:bg-blue-100"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Input area */}
      <div className="border-t p-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputElementRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              limitations && !limitations.canChat
                ? "Chat limit reached - upgrade to continue"
                : mutation.isPending
                ? "Flo is thinking... (Press Escape to cancel)"
                : "Type your message to Flo..."
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={!limitations?.canChat || mutation.isPending}
            autoComplete="off"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!inputText.trim() || !limitations?.canChat || mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {mutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
        
        {/* Show scroll to bottom button if not at bottom */}
        {!isScrolledToBottom && messages.length > 3 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsScrolledToBottom(true);
              scrollToBottom();
            }}
            className="mt-2 w-full text-xs"
          >
            Scroll to latest message
          </Button>
        )}
      </div>
    </Card>
  );
}

export default BulletproofAIChat;