import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface LandingChatProps {
  isInlineWidget?: boolean;
}

function ChatCore({ isInlineWidget = false }: LandingChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'initial',
      role: 'assistant',
      content: "Hi! I'm Flo, your Red2Blue mental performance coach. Ask me about handling pressure, improving focus, or any mental game challenge you're facing on the course.",
      timestamp: Date.now()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(isInlineWidget);
  const [isLoading, setIsLoading] = useState(false);
  const [creditCount, setCreditCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // No auto-scroll to prevent page scrolling issues

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Check credit limit
    if (creditCount >= 5) {
      const creditMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: "You've used your 5 free credits! Sign up to keep using Flo and unlock personalized coaching, assessments, and unlimited conversations.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, creditMessage]);
      return;
    }

    const userInput = input.trim();
    setInput("");
    setIsLoading(true);
    setCreditCount(prev => prev + 1);

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    // Call API
    try {
      const response = await fetch('/api/landing-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      let content = "I'm here to help with your mental game. What specific challenge are you facing on the course?";
      
      if (response.ok) {
        const data = await response.json();
        content = data.message || content;
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: content,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm here to help with your mental game. What specific challenge are you facing on the course?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const setPrompt = (prompt: string) => {
    setInput(prompt);
  };

  // Main chat content
  const chatContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.id}-${index}`}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 border'
                }`}
              >
                <p className="text-sm">{String(message.content || '')}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800 border">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <p className="text-sm">Flo is thinking...</p>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4">
        {creditCount >= 4 && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            {5 - creditCount} credit{5 - creditCount !== 1 ? 's' : ''} remaining
          </div>
        )}
        
        {/* Suggestion prompts */}
        {messages.length === 1 && (
          <div className="mb-3 space-y-2">
            <p className="text-xs text-gray-500 text-center">Try asking about:</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setPrompt("I get nervous on the first tee. My heart races and I overthink every aspect of my swing. How can I stay calm?")}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                disabled={creditCount >= 5 || isLoading}
              >
                First tee nerves
              </button>
              <button 
                onClick={() => setPrompt("I keep missing putts under pressure. My hands get shaky and I second-guess my read. What can I do?")}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                disabled={creditCount >= 5 || isLoading}
              >
                Missed putts
              </button>
              <button 
                onClick={() => setPrompt("When I'm in contention, I start thinking about the outcome instead of the shot. How do I stay present?")}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                disabled={creditCount >= 5 || isLoading}
              >
                Pressure situations
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleFormSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              creditCount >= 5 
                ? "Sign up to continue..."
                : "Ask about mental game challenges..."
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={creditCount >= 5 || isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || creditCount >= 5 || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );

  // Inline widget version
  if (isInlineWidget) {
    return (
      <Card className="w-full max-w-md mx-auto h-[500px] shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6" />
            <div>
              <CardTitle className="text-lg">Chat with Flo</CardTitle>
              <p className="text-sm text-blue-100">Your AI Mental Performance Coach</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-100px)]">
          {chatContent}
        </CardContent>
      </Card>
    );
  }

  // Floating widget version
  return (
    <>
      {!isExpanded && (
        <Button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 shadow-lg z-50"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      )}

      {isExpanded && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6" />
                <div>
                  <CardTitle className="text-lg">Chat with Flo</CardTitle>
                  <p className="text-sm text-blue-100">Your AI Mental Performance Coach</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-white/20"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-100px)]">
            {chatContent}
          </CardContent>
        </Card>
      )}
    </>
  );
}

export function LandingChatFinal({ isInlineWidget = false }: LandingChatProps) {
  try {
    return <ChatCore isInlineWidget={isInlineWidget} />;
  } catch (error) {
    console.error('Chat component error:', error);
    return (
      <Card className="w-full max-w-md mx-auto h-[500px] shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6" />
            <div>
              <CardTitle className="text-lg">Chat with Flo</CardTitle>
              <p className="text-sm text-blue-100">Your AI Mental Performance Coach</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-center h-[calc(100%-100px)]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Chat temporarily unavailable</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
}