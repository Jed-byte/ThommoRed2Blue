import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, X, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface OptimizedFloChatProps {
  isInlineWidget?: boolean;
  className?: string;
}

export function OptimizedFloChat({ isInlineWidget = false, className = "" }: OptimizedFloChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: "Hi! I'm Flo, your AI mental performance coach. Ask me about handling pressure, improving focus, or any mental game challenge you're facing.",
      timestamp: Date.now()
    }
  ]);
  
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(isInlineWidget);
  const [isLoading, setIsLoading] = useState(false);
  const [creditCount, setCreditCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Optimized scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  // Auto-scroll when messages change, but only if user is at bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    
    if (isAtBottom) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, scrollToBottom]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  // Add message with optimization
  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      id: `${message.role}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...message
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Optimized send handler with proper error handling and abort support
  const handleSend = useCallback(async () => {
    const messageText = input.trim();
    if (!messageText || isLoading) return;
    
    // Check credit limit
    if (creditCount >= 5) {
      addMessage({
        role: 'assistant',
        content: "You've used your 5 free credits! Sign up to keep using Flo and unlock personalized coaching, assessments, and unlimited conversations."
      });
      return;
    }

    // Clear previous error
    setError(null);
    
    // Clear input and update state
    setInput("");
    setIsLoading(true);
    setCreditCount(prev => prev + 1);

    // Add user message immediately
    addMessage({
      role: 'user',
      content: messageText
    });

    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/landing-chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      addMessage({
        role: 'assistant',
        content: data.message || "I'm here to help with your mental game. What specific challenge are you facing?"
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Chat request was aborted');
        return;
      }
      
      console.error('Chat error:', error);
      setError('Connection issue. Please try again.');
      
      addMessage({
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try your question again."
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, creditCount, addMessage]);

  // Cancel ongoing request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  }, [handleSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && isLoading) {
      cancelRequest();
    }
  }, [handleSend, isLoading, cancelRequest]);

  const setPrompt = useCallback((prompt: string) => {
    setInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Clear error when user starts typing
  useEffect(() => {
    if (error && input) {
      setError(null);
    }
  }, [input, error]);

  // Optimized message component
  const MessageComponent = ({ message }: { message: Message }) => (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800 border'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800 border">
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-sm">Flo is thinking...</p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={cancelRequest}
            className="ml-2 p-1 h-6 text-xs hover:bg-gray-200"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  // Main chat content with optimizations
  const chatContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Error display */}
      {error && (
        <div className="p-2 bg-red-50 border-b border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Messages container with optimized scrolling */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 scroll-smooth"
        style={{ 
          scrollBehavior: 'smooth',
          overflowAnchor: 'auto'
        }}
      >
        {messages.map((message) => (
          <MessageComponent key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>

      {/* Input area */}
      <div className="border-t p-4 bg-gray-50">
        {/* Credit warning */}
        {creditCount >= 4 && creditCount < 5 && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            {5 - creditCount} credit{5 - creditCount !== 1 ? 's' : ''} remaining
          </div>
        )}
        
        {/* Suggestion prompts - only show on first message */}
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
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              creditCount >= 5 
                ? "Sign up to continue..."
                : isLoading 
                ? "Flo is thinking... (Press Escape to cancel)"
                : "Ask about mental game challenges..."
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={creditCount >= 5}
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={!input.trim() || creditCount >= 5 || isLoading}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );

  // Inline widget version (for main page)
  if (isInlineWidget) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm h-[500px] ${className}`}>
        {chatContent}
      </div>
    );
  }

  // Floating chat widget
  return (
    <>
      {/* Floating Chat Toggle Button */}
      {!isExpanded && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsExpanded(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <MessageCircle size={24} />
          </Button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isExpanded && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-xl border z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle size={20} />
              <span className="font-medium">Chat with Flo</span>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-blue-700 p-1 h-8 w-8"
              >
                <Minimize2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-white hover:bg-blue-700 p-1 h-8 w-8"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
          
          {/* Chat Content */}
          <div className="h-[calc(100%-3rem)]">
            {chatContent}
          </div>
        </div>
      )}
    </>
  );
}

export default OptimizedFloChat;