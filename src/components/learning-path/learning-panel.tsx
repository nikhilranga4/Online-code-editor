import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getAICodeCompanion, LearningPath, CodeChallenge, CodeFeedback } from '@/lib/ai-code-companion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Code, BookOpen, Trophy, Lightbulb, Zap } from 'lucide-react';

interface LearningPanelProps {
  currentCode: string;
  language: string;
  onLoadChallenge: (code: string) => void;
}

export function LearningPanel({ currentCode, language, onLoadChallenge }: LearningPanelProps) {
  const { user } = useAuth();
  // AI companion works for both authenticated and anonymous users
  const aiCompanion = getAICodeCompanion(user);
  
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<CodeChallenge | null>(null);
  const [feedback, setFeedback] = useState<CodeFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('paths');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load learning paths when component mounts
  useEffect(() => {
    const loadPaths = async () => {
      setIsLoading(true);
      try {
        const paths = await aiCompanion.getLearningPaths();
        setLearningPaths(paths);
        
        // If user has a current path, load it
        const userProgress = aiCompanion.getUserProgress();
        if (userProgress?.currentPathId) {
          const currentPath = paths.find(p => p.id === userProgress.currentPathId);
          if (currentPath) {
            setSelectedPath(currentPath);
            
            // If user has a current challenge, load it
            if (userProgress.currentChallengeId) {
              const challenge = await aiCompanion.getCodeChallenge(userProgress.currentChallengeId);
              if (challenge) {
                setCurrentChallenge(challenge);
                setActiveTab('challenge');
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load learning paths:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPaths();
  }, [user]);
  
  // Get code suggestions when code changes
  useEffect(() => {
    const getSuggestions = async () => {
      if (currentCode && currentCode.trim().length > 10) {
        try {
          const newSuggestions = await aiCompanion.getCodeSuggestions(currentCode, language);
          setSuggestions(newSuggestions);
        } catch (error) {
          console.error('Failed to get code suggestions:', error);
        }
      }
    };
    
    // Debounce to avoid too many API calls
    const timer = setTimeout(getSuggestions, 2000);
    return () => clearTimeout(timer);
  }, [currentCode, language]);

  // Select a learning path
  const handleSelectPath = async (path: LearningPath) => {
    setSelectedPath(path);
    setActiveTab('path');
    
    // If there are challenges, select the first one
    if (path.challenges && path.challenges.length > 0) {
      const firstChallenge = await aiCompanion.getCodeChallenge(path.challenges[0].id);
      setCurrentChallenge(firstChallenge);
    }
  };

  // Select a challenge
  const handleSelectChallenge = async (challengeId: string) => {
    setIsLoading(true);
    try {
      const challenge = await aiCompanion.getCodeChallenge(challengeId);
      if (challenge) {
        setCurrentChallenge(challenge);
        setActiveTab('challenge');
        setHintsRevealed(0);
        setFeedback(null);
        
        // Update user progress
        const userProgress = aiCompanion.getUserProgress();
        if (userProgress && selectedPath) {
          // Update local state first
          userProgress.currentPathId = selectedPath.id;
          userProgress.currentChallengeId = challengeId;
          
          // Save progress through the API directly
          try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            await fetch(`${API_URL}/api/learning/progress/${userProgress.userId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('online-compiler-token')}`
              },
              body: JSON.stringify(userProgress)
            });
          } catch (error) {
            console.error('Failed to save user progress:', error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load challenge starter code
  const handleLoadStarterCode = () => {
    if (currentChallenge) {
      onLoadChallenge(currentChallenge.starterCode);
    }
  };

  // Submit solution for evaluation
  const handleSubmitSolution = async () => {
    if (!currentChallenge) return;
    
    setIsLoading(true);
    try {
      const result = await aiCompanion.submitChallengeSolution(currentChallenge.id, currentCode);
      setFeedback(result);
    } catch (error) {
      console.error('Failed to submit solution:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reveal next hint
  const handleRevealHint = async () => {
    if (!currentChallenge) return;
    
    if (hintsRevealed < currentChallenge.hints.length) {
      setHintsRevealed(hintsRevealed + 1);
    }
  };

  // Calculate completion percentage for a path
  const calculateCompletion = (path: LearningPath) => {
    const userProgress = aiCompanion.getUserProgress();
    if (!userProgress) return 0;
    
    const totalChallenges = path.challenges.length;
    if (totalChallenges === 0) return 0;
    
    const completedCount = path.challenges.filter(
      challenge => userProgress.completedChallenges.includes(challenge.id)
    ).length;
    
    return Math.round((completedCount / totalChallenges) * 100);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 bg-card border-b">
        <h2 className="text-xl font-bold flex items-center">
          <BookOpen className="mr-2 h-5 w-5" />
          AI Learning Companion
        </h2>
        <p className="text-sm text-muted-foreground">
          Interactive coding challenges with AI-powered feedback
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 border-b">
          <TabsList className="w-full">
            <TabsTrigger value="paths" className="flex-1">
              <BookOpen className="mr-2 h-4 w-4" />
              Paths
            </TabsTrigger>
            <TabsTrigger value="path" className="flex-1" disabled={!selectedPath}>
              <Zap className="mr-2 h-4 w-4" />
              Current Path
            </TabsTrigger>
            <TabsTrigger value="challenge" className="flex-1" disabled={!currentChallenge}>
              <Code className="mr-2 h-4 w-4" />
              Challenge
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex-1" disabled={!feedback}>
              <Trophy className="mr-2 h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-auto">
          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="h-full overflow-auto p-4 space-y-4">
            <h3 className="text-lg font-semibold">Learning Paths</h3>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {learningPaths.map(path => (
                  <Card key={path.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-2" onClick={() => handleSelectPath(path)}>
                      <div className="flex justify-between items-start">
                        <CardTitle>{path.title}</CardTitle>
                        <Badge variant={path.level === 'beginner' ? 'outline' : path.level === 'intermediate' ? 'secondary' : 'destructive'}>
                          {path.level}
                        </Badge>
                      </div>
                      <CardDescription>{path.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2" onClick={() => handleSelectPath(path)}>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Code className="mr-1 h-4 w-4" />
                        {path.language}
                        <span className="mx-2">•</span>
                        <Trophy className="mr-1 h-4 w-4" />
                        {path.challenges.length} challenges
                        <span className="mx-2">•</span>
                        <Clock className="mr-1 h-4 w-4" />
                        {path.estimatedHours} hours
                      </div>
                      <Progress value={calculateCompletion(path)} className="h-2" />
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleSelectPath(path)}>
                        {calculateCompletion(path) > 0 ? 'Continue' : 'Start Learning'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Selected Path Tab */}
          <TabsContent value="path" className="h-full overflow-auto p-4">
            {selectedPath && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{selectedPath.title}</h3>
                  <Badge variant={selectedPath.level === 'beginner' ? 'outline' : selectedPath.level === 'intermediate' ? 'secondary' : 'destructive'}>
                    {selectedPath.level}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">{selectedPath.description}</p>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Code className="mr-1 h-4 w-4" />
                  {selectedPath.language}
                  <span className="mx-2">•</span>
                  <Trophy className="mr-1 h-4 w-4" />
                  {selectedPath.challenges.length} challenges
                  <span className="mx-2">•</span>
                  <Clock className="mr-1 h-4 w-4" />
                  {selectedPath.estimatedHours} hours
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Concepts You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.concepts.map(concept => (
                      <Badge key={concept} variant="secondary">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Challenges</h4>
                  <div className="space-y-2">
                    {selectedPath.challenges.map(challenge => {
                      const userProgress = aiCompanion.getUserProgress();
                      const isCompleted = userProgress?.completedChallenges.includes(challenge.id);
                      
                      return (
                        <div
                          key={challenge.id}
                          className={`p-3 rounded-md border cursor-pointer hover:bg-accent/50 transition-colors ${
                            currentChallenge?.id === challenge.id ? 'border-primary' : ''
                          }`}
                          onClick={() => handleSelectChallenge(challenge.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              {isCompleted ? (
                                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                              ) : (
                                <div className="w-5 h-5 mr-2 rounded-full border border-muted-foreground" />
                              )}
                              <span className="font-medium">{challenge.title}</span>
                            </div>
                            <Badge variant={
                              challenge.difficulty === 'beginner' ? 'outline' : 
                              challenge.difficulty === 'intermediate' ? 'secondary' : 
                              'destructive'
                            }>
                              {challenge.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground ml-7 mt-1">
                            {challenge.description.length > 100 
                              ? `${challenge.description.substring(0, 100)}...` 
                              : challenge.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Challenge Tab */}
          <TabsContent value="challenge" className="h-full overflow-auto p-4">
            {currentChallenge && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{currentChallenge.title}</h3>
                  <Badge variant={
                    currentChallenge.difficulty === 'beginner' ? 'outline' : 
                    currentChallenge.difficulty === 'intermediate' ? 'secondary' : 
                    'destructive'
                  }>
                    {currentChallenge.difficulty}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground">{currentChallenge.description}</p>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Code className="mr-1 h-4 w-4" />
                  {currentChallenge.language}
                  <span className="mx-2">•</span>
                  <Clock className="mr-1 h-4 w-4" />
                  {currentChallenge.timeEstimate} min
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Concepts</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentChallenge.concepts.map(concept => (
                      <Badge key={concept} variant="secondary">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Test Cases</h4>
                  <div className="space-y-2">
                    {currentChallenge.testCases
                      .filter(test => !test.isHidden)
                      .map((test, index) => (
                        <div key={index} className="p-3 rounded-md border bg-card">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Input:</p>
                              <pre className="text-sm bg-muted p-2 rounded">{test.input || '(no input)'}</pre>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Expected Output:</p>
                              <pre className="text-sm bg-muted p-2 rounded">{test.expectedOutput || '(no output)'}</pre>
                            </div>
                          </div>
                          {test.explanation && (
                            <p className="text-xs text-muted-foreground mt-2">{test.explanation}</p>
                          )}
                        </div>
                      ))}
                    {currentChallenge.testCases.some(test => test.isHidden) && (
                      <p className="text-xs text-muted-foreground italic">
                        There are additional hidden test cases that your solution must pass.
                      </p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Hints</h4>
                  <div className="space-y-2">
                    {currentChallenge.hints.slice(0, hintsRevealed).map((hint, index) => (
                      <div key={index} className="p-3 rounded-md border bg-card">
                        <div className="flex items-start">
                          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm">{hint}</p>
                        </div>
                      </div>
                    ))}
                    
                    {hintsRevealed < currentChallenge.hints.length && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRevealHint}
                        className="w-full"
                      >
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Reveal Hint ({hintsRevealed + 1}/{currentChallenge.hints.length})
                      </Button>
                    )}
                    
                    {hintsRevealed === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Try to solve the challenge on your own first. If you get stuck, you can reveal hints.
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleLoadStarterCode} variant="outline">
                    Load Starter Code
                  </Button>
                  <Button onClick={handleSubmitSolution} disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Solution'}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Feedback Tab */}
          <TabsContent value="feedback" className="h-full overflow-auto p-4">
            {feedback && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Solution Feedback</h3>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">Score:</span>
                    <Badge variant={
                      feedback.score >= 80 ? 'default' :
                      feedback.score >= 60 ? 'secondary' :
                      'destructive'
                    }>
                      {feedback.score}/100
                    </Badge>
                  </div>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Concepts Applied</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {feedback.conceptsApplied.map(concept => (
                          <Badge key={concept} variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            {concept}
                          </Badge>
                        ))}
                        {feedback.conceptsApplied.length === 0 && (
                          <p className="text-sm text-muted-foreground">No concepts detected</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Concepts Missing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {feedback.conceptsMissing.map(concept => (
                          <Badge key={concept} variant="outline" className="bg-red-100 text-red-800 border-red-200">
                            {concept}
                          </Badge>
                        ))}
                        {feedback.conceptsMissing.length === 0 && (
                          <p className="text-sm text-muted-foreground">No missing concepts</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Time & Space Complexity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Time:</p>
                          <Badge variant="outline">{feedback.timeComplexity}</Badge>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Space:</p>
                          <Badge variant="outline">{feedback.spaceComplexity}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Readability</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Progress value={feedback.readabilityScore} className="h-2" />
                        <p className="text-xs text-center text-muted-foreground">
                          {feedback.readabilityScore}/100
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Followed:</p>
                        <ul className="space-y-1">
                          {feedback.bestPractices.followed.map((practice, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{practice}</span>
                            </li>
                          ))}
                          {feedback.bestPractices.followed.length === 0 && (
                            <p className="text-sm text-muted-foreground">None detected</p>
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Missed:</p>
                        <ul className="space-y-1">
                          {feedback.bestPractices.missed.map((practice, index) => (
                            <li key={index} className="flex items-start">
                              <AlertCircle className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{practice}</span>
                            </li>
                          ))}
                          {feedback.bestPractices.missed.length === 0 && (
                            <p className="text-sm text-muted-foreground">None detected</p>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex justify-end pt-4">
                  <Button onClick={() => setActiveTab('challenge')} variant="outline">
                    Back to Challenge
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Live Suggestions Panel */}
      {suggestions.length > 0 && activeTab === 'challenge' && (
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center mb-2">
            <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
            <h4 className="text-sm font-medium">Live Suggestions</h4>
          </div>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start">
                <span className="inline-block w-4 h-4 mr-1 text-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                  {index + 1}
                </span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Clock component for time estimates
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
