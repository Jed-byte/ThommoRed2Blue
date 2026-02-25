import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, MessageCircle, Crown, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface LandingChatProps {
  isInlineWidget?: boolean;
}

export function LandingChat({ isInlineWidget = false }: LandingChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Flo, your Red2Blue mental performance coach. Ask me about handling pressure, improving focus, or any mental game challenge you're facing on the course.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(isInlineWidget);
  const [freeMessagesCount, setFreeMessagesCount] = useState(0);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom only when new messages arrive (not when loading starts)
  useEffect(() => {
    if (!isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user has reached free message limit
    if (freeMessagesCount >= 5) {
      const userMessage: Message = {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      
      const limitMessage: Message = {
        role: 'assistant',
        content: "You've used your 5 free credits! Sign up to keep using Flo and unlock personalized coaching, assessments, and unlimited conversations.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, limitMessage]);
      setInput("");
      setShowSignUpPrompt(true);
      return;
    }

    const currentInput = input;
    setInput(""); // Clear input immediately
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: currentInput,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setFreeMessagesCount(prev => prev + 1);
    
    // Call the actual AI chat API
    try {
      const response = await fetch('/api/landing-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.message || "I'm here to help with your mental game. What specific challenge are you facing?",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Fallback response if API fails
        const assistantMessage: Message = {
          role: 'assistant',
          content: "I'm here to help with your mental game. What specific challenge are you facing on the course?",
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      // More detailed error handling
      let errorMessage = "I'm here to help with your mental game. What specific challenge are you facing on the course?";
      
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
        // Don't show technical error to user, but log it
      }
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      
      // Use functional update to ensure state consistency
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        console.log('Messages after error:', newMessages.length);
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded && !isInlineWidget) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white shadow-lg rounded-full w-16 h-16"
        >
          <MessageCircle size={24} />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={isInlineWidget ? "" : "fixed bottom-6 right-6 z-50"}>
        <Card className={isInlineWidget ? "w-full h-[500px] shadow-lg border-2 border-gray-200" : "w-96 h-[500px] shadow-2xl border-2 border-blue-200"}>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain size={20} />
                </div>
                <div>
                  <CardTitle className="text-lg">Flo AI Coach</CardTitle>
                  <p className="text-sm text-blue-100">Try me out!</p>
                </div>
              </div>
              {!isInlineWidget && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="text-white hover:bg-white/20"
                >
                  ×
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  try {
                    return (
                      <div
                        key={`message-${index}-${message.timestamp}`}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800 border'
                          }`}
                        >
                          <p className="text-sm">{message.content || "..."}</p>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Error rendering message:', error, message);
                    return (
                      <div key={`error-${index}`} className="flex justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg bg-red-100 text-red-800 border border-red-200">
                          <p className="text-sm">Message rendering error</p>
                        </div>
                      </div>
                    );
                  }
                })}
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
            </ScrollArea>
            
            <div className="border-t p-4">
              {freeMessagesCount >= 4 && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                  {5 - freeMessagesCount} credit{5 - freeMessagesCount !== 1 ? 's' : ''} remaining
                </div>
              )}
              
              {/* Example prompts - only show for fresh conversations */}
              {messages.length === 1 && (
                <div className="mb-3 space-y-2">
                  <p className="text-xs text-gray-500 text-center">Try asking about:</p>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setInput("I get nervous on the first tee. My heart races and I overthink every aspect of my swing. How can I stay calm?")}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                      disabled={freeMessagesCount >= 5}
                    >
                      First tee nerves
                    </button>
                    <button 
                      onClick={() => setInput("I missed a short putt and got frustrated")}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                      disabled={freeMessagesCount >= 5}
                    >
                      Missed putts
                    </button>
                    <button 
                      onClick={() => setInput("How do I handle pressure?")}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 transition-colors"
                      disabled={freeMessagesCount >= 5}
                    >
                      Pressure situations
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    freeMessagesCount >= 5 
                      ? "Sign up to continue..."
                      : "Ask about mental game challenges..."
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={freeMessagesCount >= 5 || isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || freeMessagesCount >= 5 || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send size={16} />
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                {freeMessagesCount}/5 credits used
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showSignUpPrompt} onOpenChange={setShowSignUpPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign up to continue with Flo!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You've experienced Flo's coaching! Sign up to unlock:</p>
            <ul className="space-y-2 text-sm">
              <li>• Unlimited AI coaching conversations</li>
              <li>• Personalized mental performance assessments</li>
              <li>• Progress tracking and analytics</li>
              <li>• Complete Red2Blue technique library</li>
            </ul>
            <div className="flex space-x-3">
              <Button 
                onClick={() => window.location.href = '/signup'} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Sign Up Free
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSignUpPrompt(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}