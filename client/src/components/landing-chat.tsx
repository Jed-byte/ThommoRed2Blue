import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, MessageCircle, Crown, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatResponse {
  message: string;
  suggestions: string[];
  urgencyLevel: string;
}

export function LandingChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Flo, your Red2Blue mental performance coach. Ask me about handling pressure, improving focus, or any mental game challenge you're facing on the course.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [freeMessagesCount, setFreeMessagesCount] = useState(0);

  // Check authentication status only when chat is opened
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: isExpanded, // Only query when chat is opened
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !!user;
  const isSubscribed = user?.isSubscribed;
  const subscriptionTier = user?.subscriptionTier;

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!isAuthenticated) {
        // For non-authenticated users, provide a mock response for demo purposes
        return {
          response: {
            message: "Thanks for trying me out! I'm Flo, your AI mental performance coach. I help golfers manage pressure and improve focus. Sign up to continue our conversation and access personalized coaching techniques."
          }
        };
      }

      const response = await apiRequest("POST", "/api/chat", {
        message,
        userId: user.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response.message,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
      if (!isAuthenticated) {
        setFreeMessagesCount(prev => prev + 1);
      }
    },
    onError: (error) => {
      if (error.message.includes("sign in")) {
        const errorMessage: Message = {
          role: 'assistant',
          content: "Please sign in to start chatting with me. I'm here to help with your mental game!",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: "I'm temporarily unavailable. Try asking about box breathing, pre-shot routines, or managing first-tee nerves.",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  });

  const handleSend = () => {
    if (!input.trim()) return;

    // Check if non-authenticated user has reached free message limit
    if (!isAuthenticated && freeMessagesCount >= 5) {
      const userMessage: Message = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      const limitMessage: Message = {
        role: 'assistant',
        content: "You've used your 5 free messages! Sign up to keep using Flo and unlock personalized coaching, assessments, and unlimited conversations.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, limitMessage]);
      setInput("");
      return;
    }

    // Add user message to chat
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Send to chat API
    chatMutation.mutate(input);

    // Check free tier limitations for authenticated users
    if (isAuthenticated && !isSubscribed && freeMessagesCount >= 5) {
      const upgradeMessage: Message = {
        role: 'assistant',
        content: "You've used your free chat message! Upgrade to Premium ($690) or Ultimate ($1590) for unlimited AI coaching sessions.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, upgradeMessage]);
      setInput("");
      return;
    }

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          data-chat-button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 shadow-lg"
        >
          <MessageCircle size={24} />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] z-50 shadow-2xl border-2 border-blue-200">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain size={20} />
            <div>
              <CardTitle className="text-lg">Flo AI Coach</CardTitle>
              <p className="text-xs opacity-90">Red2Blue Mental Performance</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-white hover:bg-white/20"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg border">
                  <p className="text-sm">Flo is thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="border-t p-4">
          {/* Show upgrade prompt if free tier limit reached */}
          {!isAuthenticated && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">Sign in to chat with Flo</p>
              <div className="flex space-x-2">
                <Link href="/signin">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" variant="outline">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {isAuthenticated && !isSubscribed && freeMessagesCount >= 1 && (
            <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-red-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-800 mb-2">Upgrade for unlimited AI coaching</p>
              <div className="flex space-x-2">
                <Link href="/premium">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Premium $490
                  </Button>
                </Link>
                <Link href="/ultimate">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white">
                    <Crown size={14} className="mr-1" />
                    Ultimate $2190
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                !isAuthenticated 
                  ? freeMessagesCount >= 5 
                    ? "Sign up to continue chatting..."
                    : "Ask about mental game challenges..."
                  : (!isSubscribed && freeMessagesCount >= 1)
                    ? "Upgrade to continue chatting..."
                    : "Ask about mental game challenges..."
              }
              className="flex-1"
              disabled={chatMutation.isPending || (!isAuthenticated && freeMessagesCount >= 5) || (isAuthenticated && !isSubscribed && freeMessagesCount >= 1)}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending || (!isAuthenticated && freeMessagesCount >= 5) || (isAuthenticated && !isSubscribed && freeMessagesCount >= 1)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send size={16} />
            </Button>
          </div>
          
          {isAuthenticated && isSubscribed && (
            <p className="text-xs text-gray-500 mt-2">
              Try: "I get nervous on the first tee" or "How do I handle pressure?"
            </p>
          )}
          
          {!isAuthenticated && (
            <p className="text-xs text-gray-500 mt-2">
              Sign in for personalized Red2Blue coaching
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}