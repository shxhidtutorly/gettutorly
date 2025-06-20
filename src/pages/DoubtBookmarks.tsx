
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUser, useClerk } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar,
  Tag,
  ArrowLeft,
  Heart,
  Share2,
  MoreVertical,
  Trash2,
  Edit3
} from "lucide-react";

interface Bookmark {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  tags: string[];
  isBookmarked: boolean;
}

const DoubtBookmarks = () => {
  const { user } =useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBookmarks: Bookmark[] = [
      {
        id: "1",
        title: "How to solve quadratic equations?",
        description: "Detailed explanation of solving quadratic equations using different methods including factoring, completing the square, and quadratic formula.",
        category: "Mathematics",
        date: "2024-01-15",
        tags: ["algebra", "equations", "mathematics"],
        isBookmarked: true
      },
      {
        id: "2", 
        title: "What is photosynthesis?",
        description: "Complete breakdown of the photosynthesis process in plants, including light and dark reactions.",
        category: "Biology",
        date: "2024-01-14",
        tags: ["biology", "plants", "science"],
        isBookmarked: true
      },
      {
        id: "3",
        title: "Explain Newton's laws of motion",
        description: "Comprehensive explanation of all three laws of motion with real-world examples and applications.",
        category: "Physics",
        date: "2024-01-13",
        tags: ["physics", "mechanics", "laws"],
        isBookmarked: true
      }
    ];
    setBookmarks(mockBookmarks);
  }, []);

  const categories = ["all", "Mathematics", "Biology", "Physics", "Chemistry", "Computer Science"];

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || bookmark.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="bg-[#202741] rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <span className="text-3xl">🔒</span>
          <p className="text-lg mt-4">Please sign in to view your bookmarks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center mt-6 mb-2 px-4 animate-fade-in">
        <Button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21253a] hover:bg-[#262a42] transition font-semibold shadow border border-[#21253a] text-white"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      <main className="flex-1 py-4 md:py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold flex items-center gap-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#ffd600] via-[#f9484a] to-[#4a90e2] drop-shadow">
              📚 Doubt Bookmarks
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-1">
              Your saved questions and explanations 🎓
            </p>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 space-y-4"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#21253a] border-[#35357a] text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-[#35357a] text-gray-300 hover:bg-[#21253a]"
                    }`}
                  >
                    <Filter className="w-3 h-3 mr-1" />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bookmarks Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredBookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group"
                >
                  <Card className="bg-[#21253a] border-[#35357a] hover:border-purple-500/50 transition-all duration-300 h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-white mb-2 line-clamp-2">
                            {bookmark.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(bookmark.date).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {bookmark.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs border-purple-400/50 text-purple-400">
                          {bookmark.category}
                        </Badge>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </Button>
                        </motion.div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {bookmark.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs bg-[#2a2a3e] text-gray-300 border-none"
                          >
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => navigate(`/doubt-chain?id=${bookmark.id}`)}
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#35357a] text-gray-300 hover:bg-[#2a2a3e]"
                        >
                          <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#35357a] text-gray-300 hover:bg-[#2a2a3e]"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty State */}
          {filteredBookmarks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-[#21253a] rounded-full flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No bookmarks found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Start bookmarking your favorite questions and explanations"
                }
              </p>
              <Button
                onClick={() => navigate('/doubt-chain')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Explore Doubt Chain
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default DoubtBookmarks;
