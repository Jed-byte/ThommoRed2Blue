import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, X, Minimize2, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user) return null;

  const { data: sessions } = useQuery({
    queryKey: [`/api/chat/sessions/${user.id}`],
    enabled: isOpen,
  });

  const currentSession = sessions?.[0];
  const messages = currentSession?.messages || [];

  const mutation = useMutation({
    mutationFn: async (data: { message: string; sessionId?: number }) => {
      const response = await apiRequest("POST", "/api/chat", {
        userId: user.id,
        message: data.message,
        sessionId: data.sessionId || currentSessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.session.id);
      queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions/${user.id}`] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: "Failed to send message. " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    mutation.mutate({
      message: message.trim(),
      sessionId: currentSessionId,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <Button
              data-chat-button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl transition-all duration-300 hover:scale-110 relative z-10"
            >
              <MessageCircle className="text-white" size={24} />
            </Button>
            
            {/* Notification Badge */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center z-20">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            
            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full bg-blue-600 opacity-30 animate-ping pointer-events-none"></div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
        }`}>
          <Card className="w-full h-full shadow-2xl border-blue-200 bg-white">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium text-white">
                      Flo - AI Coach
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-white/80">Online</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <Minimize2 size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  >
                    <X size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {!isMinimized && (
              <CardContent className="p-0 h-[430px] flex flex-col">
                {/* Welcome Message */}
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="text-white" size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>Flo:</strong> Ready to transform pressure into peak performance? 
                        Ask me about mental techniques, pressure situations, or any golf psychology challenges!
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full p-3">
                    <div className="space-y-3">
                      {messages.length === 0 ? (
                        <div className="text-center py-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MessageCircle className="text-blue-600" size={20} />
                          </div>
                          <p className="text-xs text-gray-600">
                            Ask me about pressure situations, breathing techniques, or focus strategies!
                          </p>
                        </div>
                      ) : (
                        messages.map((msg: any, index: number) => (
                          <div
                            key={index}
                            className={`flex items-start space-x-2 ${
                              msg.role === "user" ? "justify-end" : ""
                            }`}
                          >
                            {msg.role === "assistant" && (
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">T</span>
                              </div>
                            )}
                            
                            <div
                              className={`rounded-lg p-2 max-w-xs text-xs ${
                                msg.role === "user"
                                  ? "bg-blue-600 text-white rounded-tr-sm"
                                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
                              }`}
                            >
                              <p>{msg.content}</p>
                            </div>
                            
                            {msg.role === "user" && (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-gray-600 text-xs font-bold">
                                  {user.username?.[0]?.toUpperCase() || "U"}
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
                
                {/* Chat Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Input
                      data-chat-input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Flo anything..."
                      className="flex-1 text-xs"
                      disabled={mutation.isPending}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || mutation.isPending}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 p-2"
                    >
                      {mutation.isPending ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Send size={14} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}