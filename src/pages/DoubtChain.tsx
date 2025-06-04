import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Lightbulb, 
  BookOpen, 
  CheckCircle,
  Bookmark,
  Target,
  Brain,
  Zap,
  Eye,
  FileText,
  Users,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

interface DoubtNode {
  id: string;
  question: string;
  explanation?: string;
  isExplanation: boolean;
  depth: number;
  children: DoubtNode[];
  isExpanded: boolean;
  isExplored: boolean;
  followups: { [key: string]: string };
}

const DoubtChain = () => {
  const location = useLocation();
  const [initialQuestion, setInitialQuestion] = useState("");
  const [doubtTree, setDoubtTree] = useState<DoubtNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [followupLoading, setFollowupLoading] = useState<string | null>(null);
  const [bookmarkedChains, setBookmarkedChains] = useState<any[]>([]);
  const [stats, setStats] = useState({ 
    conceptsUnderstood: 0, 
    chainsCompleted: 0, 
    weeklyGoal: 20,
    currentWeekConcepts: 0
  });
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const followupOptions = [
    { key: "example", label: "What's an example?", icon: <Eye className="h-4 w-4" /> },
    { key: "reallife", label: "Real life connection?", icon: <Users className="h-4 w-4" /> },
    { key: "simple", label: "Explain like I'm 5", icon: <Lightbulb className="h-4 w-4" /> },
    { key: "formula", label: "Show formula", icon: <FileText className="h-4 w-4" /> },
    { key: "summary", label: "1-line summary", icon: <Target className="h-4 w-4" /> }
  ];

  // Load stats and bookmarks on mount
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  // Handle pre-filled question from navigation
  useEffect(() => {
    if (location.state?.prefilledQuestion) {
      setInitialQuestion(location.state.prefilledQuestion);
    }
  }, [location.state]);

  const loadUserData = () => {
    const savedStats = localStorage.getItem(`doubt_stats_${currentUser?.id}`);
    const savedBookmarks = localStorage.getItem(`doubt_bookmarks_${currentUser?.id}`);
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedBookmarks) {
      setBookmarkedChains(JSON.parse(savedBookmarks));
    }
  };

  const saveUserData = () => {
    localStorage.setItem(`doubt_stats_${currentUser?.id}`, JSON.stringify(stats));
    localStorage.setItem(`doubt_bookmarks_${currentUser?.id}`, JSON.stringify(bookmarkedChains));
  };

  const buildDoubtChain = async (question: string, depth = 0): Promise<DoubtNode> => {
    try {
      const response = await fetch('/api/doubt-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, depth })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const node: DoubtNode = {
        id: `${depth}-${Date.now()}`,
        question,
        explanation: data.isExplanation ? data.result : undefined,
        isExplanation: data.isExplanation,
        depth,
        children: [],
        isExpanded: false,
        isExplored: false,
        followups: {}
      };

      // If not at explanation level, recurse
      if (!data.isExplanation && depth < 5) {
        const childNode = await buildDoubtChain(data.result, depth + 1);
        node.children = [childNode];
      }

      return node;
    } catch (error) {
      console.error('Error building doubt chain:', error);
      throw error;
    }
  };

  const handleSubmitDoubt = async () => {
    if (!initialQuestion.trim()) return;

    setIsLoading(true);
    try {
      const tree = await buildDoubtChain(initialQuestion.trim());
      setDoubtTree(tree);
      
      // Update stats
      setStats(prev => ({ 
        ...prev, 
        chainsCompleted: prev.chainsCompleted + 1 
      }));
      
      toast({
        title: "Doubt Chain Created! 🌱",
        description: "Explore each level to understand the fundamentals"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create doubt chain",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = async (nodeId: string) => {
    if (!doubtTree) return;

    const updateNode = (node: DoubtNode): DoubtNode => {
      if (node.id === nodeId) {
        const wasExplored = node.isExplored;
        const updated = { 
          ...node, 
          isExpanded: !node.isExpanded,
          isExplored: true
        };
        
        // Track concept understanding
        if (!wasExplored) {
          setStats(prev => ({ 
            ...prev, 
            conceptsUnderstood: prev.conceptsUnderstood + 1,
            currentWeekConcepts: prev.currentWeekConcepts + 1
          }));
        }
        
        return updated;
      }
      return {
        ...node,
        children: node.children.map(updateNode)
      };
    };

    setDoubtTree(updateNode(doubtTree));
  };

  const handleFollowup = async (nodeId: string, followupType: string) => {
    setFollowupLoading(nodeId + followupType);
    
    try {
      const node = findNode(doubtTree!, nodeId);
      if (!node) return;

      const followupMap = {
        example: "What's an example of this?",
        reallife: "Can you relate this to real life?",
        simple: "Explain like I'm 5",
        formula: "Give formula (if applicable)",
        summary: "Show 1-line summary"
      };

      const response = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: node.question, 
          followup: followupMap[followupType as keyof typeof followupMap]
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Update node with followup response
      const updateNode = (n: DoubtNode): DoubtNode => {
        if (n.id === nodeId) {
          return { ...n, followups: { ...n.followups, [followupType]: data.result } };
        }
        return { ...n, children: n.children.map(updateNode) };
      };

      setDoubtTree(prev => prev ? updateNode(prev) : null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get followup response",
        variant: "destructive"
      });
    } finally {
      setFollowupLoading(null);
    }
  };

  const findNode = (node: DoubtNode, id: string): DoubtNode | null => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
    return null;
  };

  const bookmarkChain = () => {
    if (!doubtTree) return;
    
    const bookmark = {
      id: Date.now().toString(),
      originalQuestion: initialQuestion,
      tree: doubtTree,
      timestamp: new Date().toISOString()
    };
    
    setBookmarkedChains(prev => [bookmark, ...prev]);
    saveUserData();
    
    toast({
      title: "Bookmarked! 📌",
      description: "Chain saved to your bookmarks"
    });
  };

  const renderDoubtNode = (node: DoubtNode, isRoot = false) => {
    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-4"
      >
        <Card className={`transition-all duration-300 ${
          node.isExplored ? 'border-green-500 bg-green-50 dark:bg-green-950' : 
          'hover:border-blue-500 cursor-pointer'
        }`}>
          <CardHeader 
            className="pb-3 cursor-pointer"
            onClick={() => handleNodeClick(node.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {node.isExplanation ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Brain className="h-5 w-5 text-blue-500" />
                )}
                <div>
                  <CardTitle className="text-sm md:text-base">{node.question}</CardTitle>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {node.isExplanation ? 'Fundamental' : `Level ${node.depth + 1}`}
                  </Badge>
                </div>
              </div>
              {!node.isExplanation && (
                node.isExpanded ? 
                <ChevronDown className="h-5 w-5" /> : 
                <ChevronRight className="h-5 w-5" />
              )}
            </div>
          </CardHeader>
          
          <AnimatePresence>
            {node.isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent>
                  {node.explanation && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm md:text-base leading-relaxed">{node.explanation}</p>
                    </div>
                  )}
                  
                  {/* Followup buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {followupOptions.map(option => (
                      <Button
                        key={option.key}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleFollowup(node.id, option.key)}
                        disabled={followupLoading === node.id + option.key}
                      >
                        {option.icon}
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Followup responses */}
                  {Object.entries(node.followups).map(([type, response]) => (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded border-l-4 border-yellow-400"
                    >
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        {followupOptions.find(o => o.key === type)?.label}
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">{response}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        
        {/* Render children */}
        {node.children.length > 0 && (
          <div className="ml-4 md:ml-8 mt-4 border-l-2 border-dashed border-gray-300 pl-4">
            {node.children.map(child => renderDoubtNode(child))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      <main className="flex-1 py-4 md:py-8 px-2 md:px-4 pb-20 md:pb-8">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 md:mb-8"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-purple-500" />
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                AI Doubt Chain
              </h1>
            </div>
            <p className="text-muted-foreground">
              Break down complex concepts into simple, understandable parts
            </p>
          </motion.div>

          {/* Stats Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
          >
            <Card className="dark:bg-card">
              <CardContent className="p-3 md:p-4 text-center">
                <Award className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-lg font-bold">{stats.conceptsUnderstood}</p>
                <p className="text-xs text-muted-foreground">Concepts</p>
              </CardContent>
            </Card>
            <Card className="dark:bg-card">
              <CardContent className="p-3 md:p-4 text-center">
                <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-lg font-bold">{stats.chainsCompleted}</p>
                <p className="text-xs text-muted-foreground">Chains</p>
              </CardContent>
            </Card>
            <Card className="dark:bg-card col-span-2">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-medium">Weekly Goal</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: `${Math.min((stats.currentWeekConcepts / stats.weeklyGoal) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.currentWeekConcepts}/{stats.weeklyGoal} concepts this week
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="dark:bg-card">
              <CardContent className="p-4 md:p-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask your doubt... (e.g., Why does chlorophyll appear green?)"
                    value={initialQuestion}
                    onChange={(e) => setInitialQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSubmitDoubt()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSubmitDoubt}
                    disabled={isLoading || !initialQuestion.trim()}
                    className="px-4 md:px-6"
                  >
                    {isLoading ? (
                      <div className="loading-spinner" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Doubt Tree */}
          {doubtTree && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Doubt Chain</h2>
                <Button
                  variant="outline"
                  onClick={bookmarkChain}
                  className="flex items-center gap-2"
                >
                  <Bookmark className="h-4 w-4" />
                  Bookmark
                </Button>
              </div>
              
              {renderDoubtNode(doubtTree, true)}
              
              {/* Final explanation button */}
              <Card className="mt-6 dark:bg-gradient-to-r dark:from-purple-950 dark:to-blue-950 border-purple-500">
                <CardContent className="p-4 md:p-6 text-center">
                  <Button
                    className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={() => handleFollowup(doubtTree.id, 'summary')}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Now explain my original doubt using everything above
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Back to Dashboard */}
          <div className="flex justify-center">
            <BackToDashboardButton />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default DoubtChain;
