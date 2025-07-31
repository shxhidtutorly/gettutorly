import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
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
  Award,
  ArrowLeftCircle,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [initialQuestion, setInitialQuestion] = useState("");
  const [doubtTree, setDoubtTree] = useState<DoubtNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [followupLoading, setFollowupLoading] = useState<string | null>(null);
  const [bookmarkedChains, setBookmarkedChains] = useState<any[]>([]);
  const [stats, setStats] = useState({
    conceptsUnderstood: 0,
    chainsCompleted: 0,
    weeklyGoal: 20,
    currentWeekConcepts: 0,
  });
  const { user } = useUser();
  const { toast } = useToast();

  const followupOptions = [
    { key: "example", label: "Example", icon: <Eye className="h-4 w-4" /> },
    { key: "reallife", label: "Real Life", icon: <Users className="h-4 w-4" /> },
    { key: "simple", label: "Explain Simply", icon: <Lightbulb className="h-4 w-4" /> },
    { key: "formula", label: "Formula", icon: <FileText className="h-4 w-4" /> },
    { key: "summary", label: "Summary", icon: <Target className="h-4 w-4" /> },
  ];

  // Brutalist-style Animations
  const nodeAnim = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 15,
      },
    },
    hover: {
      scale: 1.01,
      boxShadow: "8px 8px 0px 0px #ffffff", // A high-contrast shadow
      transition: { duration: 0.1 },
    },
    tap: {
      scale: 0.98,
      x: 4,
      y: 4,
      boxShadow: "2px 2px 0px 0px #ffffff", // "Press" effect
      transition: { duration: 0.1 },
    },
  };

  const buttonAnim = {
    hover: {
      scale: 1.05,
      boxShadow: "6px 6px 0px 0px #ffffff",
    },
    tap: {
      scale: 0.95,
      x: 3,
      y: 3,
      boxShadow: "1px 1px 0px 0px #ffffff",
    },
  };

  const containerAnim = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnim = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Load stats and bookmarks on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = () => {
    const savedStats = localStorage.getItem(`doubt_stats_${user?.id}`);
    const savedBookmarks = localStorage.getItem(`doubt_bookmarks_${user?.id}`);
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedBookmarks) setBookmarkedChains(JSON.parse(savedBookmarks));
  };

  const saveUserData = () => {
    localStorage.setItem(`doubt_stats_${user?.id}`, JSON.stringify(stats));
    localStorage.setItem(`doubt_bookmarks_${user?.id}`, JSON.stringify(bookmarkedChains));
  };

  const buildDoubtChain = async (question: string, depth = 0): Promise<DoubtNode> => {
    try {
      // API call placeholder
      //const data = {
        //isExplanation: depth >= 2,
        //result: depth === 0
          //? "The process of photosynthesis"
          //: depth === 1
            //? "What is chlorophyll?"
            //: "Chlorophyll is a green pigment found in plants that absorbs light energy to convert it into chemical energy.",
      const response = await fetch('/api/doubt-chain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, depth })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
      
      const node: DoubtNode = {
        id: `${depth}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        question: data.isExplanation ? data.result : data.result,
        explanation: data.isExplanation ? data.result : undefined,
        isExplanation: data.isExplanation,
        depth,
        children: [],
        isExpanded: false,
        isExplored: false,
        followups: {},
      };

      // If not at explanation level, recurse
      if (!data.isExplanation && depth < 5) {
        const childNode = await buildDoubtChain(data.result, depth + 1);
        node.children = [childNode];
      }

      return node;
    } catch (error) {
      console.error("Error building doubt chain:", error);
      throw error;
    }
  };

  const handleSubmitDoubt = async () => {
    if (!initialQuestion.trim()) return;
    setIsLoading(true);
    try {
      const tree = await buildDoubtChain(initialQuestion.trim());
      setDoubtTree(tree);
      setStats((prev) => ({ ...prev, chainsCompleted: prev.chainsCompleted + 1 }));
      toast({
        title: "Doubt Chain Created!",
        description: "Explore each level to understand the fundamentals",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create doubt chain",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (!doubtTree) return;

    const updateNode = (node: DoubtNode): DoubtNode => {
      if (node.id === nodeId) {
        const wasExplored = node.isExplored;
        const updated = {
          ...node,
          isExpanded: !node.isExpanded,
          isExplored: true,
        };
        // Track concept understanding
        if (!wasExplored) {
          setStats((prev) => ({
            ...prev,
            conceptsUnderstood: prev.conceptsUnderstood + 1,
            currentWeekConcepts: prev.currentWeekConcepts + 1,
          }));
        }
        return updated;
      }
      return {
        ...node,
        children: node.children.map(updateNode),
      };
    };

    setDoubtTree(updateNode(doubtTree));
  };

 const handleFollowup = async (nodeId: string, followupType: string) => {
    setFollowupLoading(nodeId + followupType);
    try {
      const node = findNode(doubtTree!, nodeId);
      if (!node) return;


      const response = await fetch('/api/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: node.question, followup: followupType })
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

      setDoubtTree((prev) => (prev ? updateNode(prev) : null));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get followup response",
        variant: "destructive",
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

  const isChainFullyExplored = (node: DoubtNode | null): boolean => {
    if (!node) return false;
    if (!node.isExplored) return false;
    return node.children.every(isChainFullyExplored);
  };

  const bookmarkChain = () => {
    if (!doubtTree) return;
    const bookmark = {
      id: Date.now().toString(),
      originalQuestion: initialQuestion,
      tree: doubtTree,
      timestamp: new Date().toISOString(),
    };
    setBookmarkedChains((prev) => [bookmark, ...prev]);
    saveUserData();
    toast({
      title: "Bookmarked!",
      description: "Chain saved to your bookmarks",
    });
  };

  const renderDoubtNode = (node: DoubtNode, isRoot = false) => {
    const isExpanded = node.isExpanded;
    return (
      <motion.div
        key={node.id}
        variants={nodeAnim}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        className="mb-6"
        layout
      >
        <Card
          className={`transition-all duration-100 ease-in-out cursor-pointer bg-black text-white p-0 border-2 border-white rounded-none
            ${node.isExplored ? "bg-purple-950 border-purple-400" : "hover:border-purple-400"}`}
        >
          <CardHeader
            className="pb-3 px-4 md:px-6 py-4"
            onClick={() => handleNodeClick(node.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 p-2 border-2 border-white rounded-none ${
                    node.isExplanation ? "bg-green-400" : "bg-cyan-400"
                  }`}
                >
                  {node.isExplanation ? (
                    <CheckCircle className="h-5 w-5 text-black" />
                  ) : (
                    <Brain className="h-5 w-5 text-black" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-sm md:text-base font-bold text-white">
                    {node.question}
                  </CardTitle>
                  <Badge
                    variant="default"
                    className={`mt-1 text-xs font-mono font-normal rounded-none border-2 border-white ${
                      node.isExplanation ? "bg-green-400 text-black" : "bg-cyan-400 text-black"
                    }`}
                  >
                    {node.isExplanation ? "FUNDAMENTAL" : `LEVEL ${node.depth + 1}`}
                  </Badge>
                </div>
              </div>
              {!node.isExplanation && (
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                  <ChevronDown className="h-6 w-6" />
                </motion.div>
              )}
            </div>
          </CardHeader>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, type: "tween" }}
                className="overflow-hidden"
              >
                <CardContent className="pt-4 pb-6 px-4 md:px-6">
                  {node.explanation && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 border-2 border-white rounded-none bg-yellow-950/20"
                    >
                      <p className="text-sm md:text-base leading-relaxed text-yellow-300">
                        {node.explanation}
                      </p>
                    </motion.div>
                  )}
                  {/* Followup buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {followupOptions.map((option, idx) => (
                      <motion.div
                        key={option.key}
                        variants={itemAnim}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.05 * idx }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-mono rounded-none border-2 border-white bg-black text-white hover:bg-yellow-400 hover:text-black transition-colors"
                          onClick={() => handleFollowup(node.id, option.key)}
                          disabled={followupLoading === node.id + option.key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {option.icon}
                          {option.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  {/* Followup responses */}
                  <div>
                    {Object.entries(node.followups).map(([type, response], idx) => (
                      <motion.div
                        key={type}
                        variants={itemAnim}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.08 * idx }}
                        className="mb-2 p-3 bg-yellow-950/40 rounded-none border-l-4 border-yellow-300"
                      >
                        <p className="text-sm font-bold text-yellow-300 mb-1">
                          {followupOptions.find((o) => o.key === type)?.label}:
                        </p>
                        <p className="text-sm text-yellow-200">{response}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
        {/* Render children */}
        <AnimatePresence>
          {isExpanded && node.children.length > 0 && (
            <motion.div
              key={`${node.id}-children`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pl-6 ml-4 relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-white before:opacity-20 before:rounded-full before:z-0"
            >
              <div className="relative z-10 flex flex-col gap-4 pt-4">
                {node.children.map((child, i) => (
                  <motion.div key={child.id} layout variants={itemAnim} custom={i}>
                    {renderDoubtNode(child, false)}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white font-sans">
      <Navbar />
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Brain className="h-10 w-10 text-cyan-400" />
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-bold font-mono text-white drop-shadow-[0_4px_4px_rgba(0,255,255,0.2)]">
                AI DOUBT CHAIN
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-400 font-mono">
              Break down complex concepts into fundamental, digestible parts.
            </p>
          </motion.div>
          {/* Stats Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          >
            <motion.div whileHover="hover" whileTap="tap" variants={buttonAnim}>
              <Card className="dark:bg-black p-0 border-2 border-white rounded-none">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-300 mb-2" />
                  <p className="text-2xl font-bold">{stats.conceptsUnderstood}</p>
                  <p className="text-xs text-gray-400">CONCEPTS</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonAnim}>
              <Card className="dark:bg-black p-0 border-2 border-white rounded-none">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold">{stats.chainsCompleted}</p>
                  <p className="text-xs text-gray-400">CHAINS</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonAnim} className="col-span-2">
              <Card className="dark:bg-black p-4 border-2 border-white rounded-none">
                <CardContent className="p-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    <p className="text-sm font-bold">WEEKLY GOAL</p>
                  </div>
                  <div className="w-full bg-gray-800 border-2 border-white h-4 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((stats.currentWeekConcepts / stats.weeklyGoal) * 100, 100)}%`,
                      }}
                      transition={{ duration: 0.5 }}
                      className="bg-purple-400 h-full rounded-full transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.currentWeekConcepts}/{stats.weeklyGoal} concepts this week
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <Card className="dark:bg-black p-0 border-2 border-white rounded-none">
              <CardContent className="p-4 md:p-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask your doubt..."
                    value={initialQuestion}
                    onChange={(e) => setInitialQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmitDoubt()}
                    className="flex-1 rounded-none border-2 border-white bg-black text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <motion.div whileHover="hover" whileTap="tap" variants={buttonAnim}>
                    <Button
                      onClick={handleSubmitDoubt}
                      disabled={isLoading || !initialQuestion.trim()}
                      className="px-4 md:px-6 rounded-none border-2 border-white bg-cyan-400 text-black hover:bg-cyan-500"
                    >
                      {isLoading ? (
                        <div className="loading-spinner" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          {/* Doubt Tree */}
          {doubtTree && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerAnim}
              className="mb-6 relative"
              layout="position"            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold font-mono text-white">
                  YOUR DOUBT CHAIN
                </h2>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonAnim}>
                  <Button
                    onClick={bookmarkChain}
                    className="flex items-center gap-2 rounded-none border-2 border-white bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    <Bookmark className="h-4 w-4" />
                    Bookmark
                  </Button>
                </motion.div>
              </div>
              {renderDoubtNode(doubtTree, true)}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default DoubtChain;
