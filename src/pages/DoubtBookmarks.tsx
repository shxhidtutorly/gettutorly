import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  Bookmark, 
  Calendar, 
  Tag, 
  ExternalLink,
  Trash2,
  BookmarkCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useFeatureData } from "@/hooks/useFeatureData";

interface BookmarkedDoubt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  created_at: string;
  bookmarked_at: string;
  userId: string;
  originalDoubtId: string;
}

const DoubtBookmarks = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const { data: bookmarks, loading, refetch } = useFeatureData<BookmarkedDoubt>(
    user?.uid || null, 
    'doubt_bookmarks'
  );

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      // This would be implemented in firebase-db.ts
      await refetch();
      toast({
        title: "Bookmark removed",
        description: "The doubt has been removed from your bookmarks."
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredBookmarks = bookmarks?.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = selectedSubject === "all" || bookmark.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "all" || bookmark.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  }) || [];

  const subjects = Array.from(new Set(bookmarks?.map(b => b.subject) || []));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BookmarkCheck className="h-8 w-8 text-yellow-400" />
              Bookmarked Doubts
            </h1>
            <p className="text-gray-400">Your saved doubts and solutions for quick reference</p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bookmarked doubts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1A1A1A] border-slate-600 text-white"
              />
            </div>
            
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-[#1A1A1A] border border-slate-600 rounded-md text-white"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 bg-[#1A1A1A] border border-slate-600 rounded-md text-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </motion.div>

          {/* Bookmarks Grid */}
          {filteredBookmarks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {bookmarks?.length === 0 ? "No bookmarks yet" : "No bookmarks found"}
              </h3>
              <p className="text-gray-500">
                {bookmarks?.length === 0 
                  ? "Start bookmarking doubts to save them for later reference"
                  : "Try adjusting your search terms or filters"
                }
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 grid-cols-1 lg:grid-cols-2"
            >
              <AnimatePresence>
                {filteredBookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-[#1A1A1A] border-slate-700 hover:border-yellow-500 transition-colors group h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2 line-clamp-2">
                              {bookmark.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  bookmark.difficulty === 'easy' ? 'border-green-500 text-green-400' :
                                  bookmark.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                  'border-red-500 text-red-400'
                                }`}
                              >
                                {bookmark.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                                {bookmark.subject}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveBookmark(bookmark.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-gray-300 text-sm line-clamp-3">
                            {bookmark.content}
                          </p>
                          
                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {bookmark.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-gray-400">
                                  <Tag className="w-2 h-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Bookmarked {new Date(bookmark.bookmarked_at).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800"
                              onClick={() => {
                                // Navigate to original doubt
                                window.location.href = `/doubt-chain?id=${bookmark.originalDoubtId}`;
                              }}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View Original
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
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
