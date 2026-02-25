import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MessageCircle, 
  Brain, 
  Heart, 
  Target, 
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface CoachingAnimationsProps {
  context: 'welcome' | 'assessment' | 'practice' | 'achievement' | 'encouragement';
  userName?: string;
  onComplete?: () => void;
}

const coachingMessages = {
  welcome: {
    avatar: "👨‍💼",
    name: "Coach Flo",
    messages: [
      "Welcome to your mental performance journey! I'm here to guide you every step of the way.",
      "Together, we'll build the mental resilience that separates good golfers from champions.",
      "Let's start by understanding where you are right now, so we can create your personalized path to excellence."
    ],
    tone: "warm"
  },
  assessment: {
    avatar: "🧠",
    name: "Coach Flo",
    messages: [
      "I can see you're reflecting deeply on your performance. That's exactly the mindset of a champion.",
      "Your honest self-assessment is the foundation of all meaningful improvement.",
      "Remember, every tour professional has faced similar challenges. What matters is how we respond."
    ],
    tone: "analytical"
  },
  practice: {
    avatar: "💪",
    name: "Coach Flo",
    messages: [
      "Excellent work on that technique! I can see your mental muscle memory strengthening.",
      "Each practice session builds neural pathways that will serve you under pressure.",
      "Your consistency in training is what will make these skills automatic when it matters most."
    ],
    tone: "encouraging"
  },
  achievement: {
    avatar: "🏆",
    name: "Coach Flo",
    messages: [
      "Outstanding! You've just demonstrated the kind of mental fortitude that defines elite performers.",
      "This breakthrough moment is proof that your dedicated practice is paying dividends.",
      "Feel that confidence building? That's your new mental baseline taking hold."
    ],
    tone: "celebratory"
  },
  encouragement: {
    avatar: "❤️",
    name: "Coach Flo",
    messages: [
      "I understand this feels challenging right now. Every champion has walked this exact path.",
      "Your willingness to push through discomfort is what separates you from those who give up.",
      "Trust the process. Small, consistent improvements compound into extraordinary results."
    ],
    tone: "supportive"
  }
};

export function CoachingAnimations({ context, userName, onComplete }: CoachingAnimationsProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showThoughts, setShowThoughts] = useState(false);

  const coaching = coachingMessages[context];
  const currentMessage = coaching.messages[currentMessageIndex];

  useEffect(() => {
    if (currentMessageIndex < coaching.messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, coaching.messages.length]);

  useEffect(() => {
    setIsTyping(true);
    const typingTimer = setTimeout(() => setIsTyping(false), 1500);
    return () => clearTimeout(typingTimer);
  }, [currentMessageIndex]);

  useEffect(() => {
    const thoughtsTimer = setTimeout(() => setShowThoughts(true), 2000);
    return () => clearTimeout(thoughtsTimer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'warm': return 'from-blue-500 to-cyan-500';
      case 'analytical': return 'from-purple-500 to-indigo-500';
      case 'encouraging': return 'from-green-500 to-emerald-500';
      case 'celebratory': return 'from-yellow-500 to-orange-500';
      case 'supportive': return 'from-pink-500 to-rose-500';
      default: return 'from-blue-500 to-purple-500';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="fixed bottom-4 right-4 z-50 max-w-sm"
      >
        <Card className="bg-white shadow-xl border-0 overflow-hidden">
          <div className={`h-1 bg-gradient-to-r ${getToneColor(coaching.tone)}`}></div>
          
          <CardContent className="p-4">
            {/* Coach Avatar and Header */}
            <div className="flex items-center space-x-3 mb-3">
              <motion.div
                animate={{ 
                  scale: isTyping ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.5, repeat: isTyping ? Infinity : 0 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                  {coaching.avatar}
                </div>
                
                {isTyping && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  </motion.div>
                )}
              </motion.div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">{coaching.name}</h4>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <p className="text-xs text-gray-500">Your AI Mental Performance Coach</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ×
              </Button>
            </div>

            {/* Message Content */}
            <motion.div
              key={currentMessageIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              {isTyping ? (
                <div className="flex items-center space-x-1 text-gray-500">
                  <span className="text-sm">Coach Flo is typing</span>
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex space-x-1"
                  >
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </motion.div>
                </div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  {userName && currentMessageIndex === 0 
                    ? currentMessage.replace("Welcome", `Welcome ${userName}`)
                    : currentMessage
                  }
                </motion.p>
              )}
            </motion.div>

            {/* Coaching Insights */}
            <AnimatePresence>
              {showThoughts && !isTyping && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                >
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-600">
                      <p className="font-medium text-gray-700 mb-1">Coach's Insight:</p>
                      {context === 'welcome' && "Mental training is like physical training - consistency beats intensity every time."}
                      {context === 'assessment' && "Self-awareness is the first skill of every elite performer."}
                      {context === 'practice' && "Neural pathways strengthen with each repetition, making skills automatic."}
                      {context === 'achievement' && "Celebrate wins to reinforce positive neural patterns."}
                      {context === 'encouragement' && "Resilience is built in moments of challenge, not comfort."}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {coaching.messages.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index <= currentMessageIndex ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                    animate={{
                      scale: index === currentMessageIndex ? [1, 1.2, 1] : 1
                    }}
                    transition={{ duration: 0.5 }}
                  />
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                {currentMessageIndex < coaching.messages.length - 1 ? (
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="flex items-center text-xs text-gray-400"
                  >
                    <span>More insights</span>
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </motion.div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleDismiss}
                    className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Got it!
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-2 -left-2 text-blue-500"
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-1 -right-2 text-purple-500"
        >
          <Heart className="w-3 h-3" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}