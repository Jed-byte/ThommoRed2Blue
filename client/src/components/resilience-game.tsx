import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  Zap, 
  Heart, 
  Shield, 
  Award, 
  RotateCcw,
  Timer,
  TrendingUp,
  Brain
} from "lucide-react";

interface GameScenario {
  id: number;
  title: string;
  description: string;
  situation: string;
  options: {
    id: string;
    text: string;
    resilienceImpact: number;
    explanation: string;
    colorCode: "red" | "orange" | "yellow" | "green" | "blue";
  }[];
  timeLimit: number;
}

interface GameState {
  currentScenario: number;
  score: number;
  resilienceLevel: number;
  timeRemaining: number;
  isActive: boolean;
  selectedOption: string | null;
  feedback: string;
  streak: number;
  totalScenarios: number;
}

const gameScenarios: GameScenario[] = [
  {
    id: 1,
    title: "Pressure Moment",
    description: "You're facing a crucial moment to win the competition",
    situation: "Standing ready for the decisive play, you notice the crowd has gone silent. Your hands feel slightly shaky, and negative thoughts creep in about failing.",
    options: [
      {
        id: "a",
        text: "Take deep breaths and focus on your routine",
        resilienceImpact: 15,
        explanation: "Excellent choice! Returning to your breathing and routine helps regulate your nervous system and builds confidence.",
        colorCode: "green"
      },
      {
        id: "b",
        text: "Think about all the successful plays you've made before",
        resilienceImpact: 10,
        explanation: "Good positive thinking, but focusing on past performance can sometimes add pressure. Present-moment awareness is better.",
        colorCode: "yellow"
      },
      {
        id: "c",
        text: "Try to block out the pressure completely",
        resilienceImpact: 5,
        explanation: "Fighting thoughts often makes them stronger. Acknowledging pressure while staying focused is more effective.",
        colorCode: "orange"
      },
      {
        id: "d",
        text: "Rush the play to get it over with",
        resilienceImpact: -5,
        explanation: "Rushing breaks your rhythm and increases mistake likelihood. Slowing down builds confidence.",
        colorCode: "red"
      }
    ],
    timeLimit: 15
  },
  {
    id: 2,
    title: "Adverse Conditions",
    description: "Difficult conditions are affecting your performance significantly",
    situation: "You're behind with limited time left. The conditions have turned challenging, and you just made two poor plays in a row due to the circumstances.",
    options: [
      {
        id: "a",
        text: "Adjust your strategy and accept the conditions",
        resilienceImpact: 12,
        explanation: "Smart adaptation! Accepting what you can't control and adjusting your approach shows true mental toughness.",
        colorCode: "green"
      },
      {
        id: "b",
        text: "Get frustrated and blame the conditions",
        resilienceImpact: -8,
        explanation: "Blaming external factors wastes mental energy and keeps you stuck in negativity.",
        colorCode: "red"
      },
      {
        id: "c",
        text: "Try to play your normal game despite conditions",
        resilienceImpact: 3,
        explanation: "Shows determination but ignoring conditions can lead to more mistakes. Adaptation is key.",
        colorCode: "orange"
      },
      {
        id: "d",
        text: "Use the conditions as motivation to focus harder",
        resilienceImpact: 8,
        explanation: "Good mindset shift! Using adversity as fuel can work, though acceptance is usually more sustainable.",
        colorCode: "yellow"
      }
    ],
    timeLimit: 12
  },
  {
    id: 3,
    title: "Equipment Malfunction",
    description: "Your favorite equipment breaks during competition",
    situation: "Midway through, your trusted equipment fails. You're having a great performance and this could derail your momentum completely.",
    options: [
      {
        id: "a",
        text: "Stay calm and adapt with available options",
        resilienceImpact: 14,
        explanation: "Perfect resilience response! Staying calm and adapting quickly shows excellent mental flexibility.",
        colorCode: "green"
      },
      {
        id: "b",
        text: "Get angry and let it affect your attitude",
        resilienceImpact: -10,
        explanation: "Understandable but destructive. Anger clouds judgment and affects subsequent performance.",
        colorCode: "red"
      },
      {
        id: "c",
        text: "Worry about how this will impact your performance",
        resilienceImpact: -3,
        explanation: "Natural concern but worrying about future plays takes you out of the present moment.",
        colorCode: "orange"
      },
      {
        id: "d",
        text: "See it as a challenge to test your skills",
        resilienceImpact: 11,
        explanation: "Great reframe! Viewing setbacks as opportunities builds confidence and resilience.",
        colorCode: "yellow"
      }
    ],
    timeLimit: 10
  }
];

export function ResilienceGame() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: 0,
    score: 0,
    resilienceLevel: 50,
    timeRemaining: 0,
    isActive: false,
    selectedOption: null,
    feedback: "",
    streak: 0,
    totalScenarios: gameScenarios.length
  });

  const [gameHistory, setGameHistory] = useState<Array<{
    scenario: string;
    choice: string;
    impact: number;
    timestamp: string;
  }>>([]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isActive && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (gameState.isActive && gameState.timeRemaining === 0) {
      handleTimeUp();
    }

    return () => clearInterval(interval);
  }, [gameState.isActive, gameState.timeRemaining]);

  const startGame = () => {
    setGameState({
      currentScenario: 0,
      score: 0,
      resilienceLevel: 50,
      timeRemaining: gameScenarios[0].timeLimit,
      isActive: true,
      selectedOption: null,
      feedback: "",
      streak: 0,
      totalScenarios: gameScenarios.length
    });
    setGameHistory([]);
  };

  const handleTimeUp = () => {
    setGameState(prev => ({
      ...prev,
      feedback: "Time's up! Quick decisions under pressure are important in golf.",
      resilienceLevel: Math.max(0, prev.resilienceLevel - 5),
      isActive: false
    }));
  };

  const handleOptionSelect = (optionId: string) => {
    if (!gameState.isActive || gameState.selectedOption) return;

    const currentScenario = gameScenarios[gameState.currentScenario];
    const selectedOption = currentScenario.options.find(opt => opt.id === optionId);
    
    if (!selectedOption) return;

    const newResilienceLevel = Math.min(100, Math.max(0, gameState.resilienceLevel + selectedOption.resilienceImpact));
    const pointsEarned = Math.max(0, selectedOption.resilienceImpact * 10 + gameState.timeRemaining * 2);
    const newStreak = selectedOption.resilienceImpact > 8 ? gameState.streak + 1 : 0;

    setGameState(prev => ({
      ...prev,
      selectedOption: optionId,
      feedback: selectedOption.explanation,
      resilienceLevel: newResilienceLevel,
      score: prev.score + pointsEarned,
      streak: newStreak,
      isActive: false
    }));

    setGameHistory(prev => [...prev, {
      scenario: currentScenario.title,
      choice: selectedOption.text,
      impact: selectedOption.resilienceImpact,
      timestamp: new Date().toLocaleTimeString()
    }]);

    if (selectedOption.resilienceImpact > 10) {
      toast({
        title: "Excellent Choice!",
        description: `+${pointsEarned} points! Your resilience is growing.`,
      });
    }
  };

  const nextScenario = () => {
    const nextIndex = gameState.currentScenario + 1;
    
    if (nextIndex < gameScenarios.length) {
      setGameState(prev => ({
        ...prev,
        currentScenario: nextIndex,
        timeRemaining: gameScenarios[nextIndex].timeLimit,
        selectedOption: null,
        feedback: "",
        isActive: true
      }));
    } else {
      endGame();
    }
  };

  const endGame = () => {
    const finalGrade = getFinalGrade(gameState.resilienceLevel);
    toast({
      title: "Game Complete!",
      description: `Final Resilience Level: ${gameState.resilienceLevel}% - ${finalGrade}`,
    });
  };

  const getFinalGrade = (level: number) => {
    if (level >= 80) return "Mental Fortress";
    if (level >= 65) return "Resilient Warrior";
    if (level >= 50) return "Steady Performer";
    if (level >= 35) return "Building Strength";
    return "Keep Training";
  };

  const getResilienceColor = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 65) return "bg-blue-500";
    if (level >= 50) return "bg-yellow-500";
    if (level >= 35) return "bg-orange-500";
    return "bg-red-500";
  };

  const getOptionColor = (colorCode: string) => {
    const colors = {
      green: "border-green-500 hover:bg-green-50",
      yellow: "border-yellow-500 hover:bg-yellow-50",
      orange: "border-orange-500 hover:bg-orange-50",
      red: "border-red-500 hover:bg-red-50",
      blue: "border-blue-500 hover:bg-blue-50"
    };
    return colors[colorCode];
  };

  const currentScenario = gameScenarios[gameState.currentScenario];

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            Mental Resilience Challenge
            {gameState.streak > 2 && (
              <Badge className="bg-orange-100 text-orange-800">
                <Zap className="w-3 h-3 mr-1" />
                {gameState.streak} Streak!
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{gameState.score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{gameState.resilienceLevel}%</div>
              <div className="text-sm text-gray-600">Resilience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{gameState.currentScenario + 1}/{gameState.totalScenarios}</div>
              <div className="text-sm text-gray-600">Scenario</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{gameState.timeRemaining}s</div>
              <div className="text-sm text-gray-600">Time Left</div>
            </div>
          </div>

          {/* Resilience Level Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Mental Resilience Level</span>
              <Badge className={`${getResilienceColor(gameState.resilienceLevel)} text-white`}>
                {getFinalGrade(gameState.resilienceLevel)}
              </Badge>
            </div>
            <Progress value={gameState.resilienceLevel} className="h-3" />
          </div>

          {!gameState.isActive && gameState.currentScenario === 0 && !gameState.selectedOption && (
            <div className="text-center py-6">
              <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Build Your Mental Resilience</h3>
              <p className="text-gray-600 mb-4">
                Face pressure situations and make quick decisions to strengthen your mental game
              </p>
              <Button onClick={startGame} size="lg">
                <Target className="w-4 h-4 mr-2" />
                Start Challenge
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Scenario */}
      {gameState.isActive || gameState.selectedOption ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentScenario.title}</span>
              {gameState.isActive && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {gameState.timeRemaining}s
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-gray-700 mb-3">{currentScenario.description}</p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-900 italic">"{currentScenario.situation}"</p>
              </div>
            </div>

            <div className="space-y-3">
              {currentScenario.options.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className={`w-full text-left p-4 h-auto justify-start overflow-hidden whitespace-normal ${getOptionColor(option.colorCode)} ${
                    gameState.selectedOption === option.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleOptionSelect(option.id)}
                  disabled={!gameState.isActive || !!gameState.selectedOption}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mt-1 flex-shrink-0">
                      {option.id.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="break-words">{option.text}</p>
                      {gameState.selectedOption === option.id && (
                        <p className="text-sm text-gray-600 mt-2 break-words">{option.explanation}</p>
                      )}
                    </div>
                    {gameState.selectedOption === option.id && (
                      <div className="flex items-center gap-1">
                        {option.resilienceImpact > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                        )}
                        <span className={`font-medium ${option.resilienceImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {option.resilienceImpact > 0 ? '+' : ''}{option.resilienceImpact}
                        </span>
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>

            {gameState.selectedOption && (
              <div className="mt-6 flex justify-center">
                {gameState.currentScenario < gameState.totalScenarios - 1 ? (
                  <Button onClick={nextScenario}>
                    Next Scenario
                  </Button>
                ) : (
                  <Button onClick={endGame} className="bg-green-600 hover:bg-green-700">
                    <Award className="w-4 h-4 mr-2" />
                    Complete Challenge
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Game History */}
      {gameHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Your Choices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{entry.scenario}:</span>
                    <span className="text-gray-600 ml-2">{entry.choice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${entry.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {entry.impact > 0 ? '+' : ''}{entry.impact}
                    </span>
                    <span className="text-xs text-gray-500">{entry.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}