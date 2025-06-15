import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { BackToDashboardButton } from "@/components/features/BackToDashboardButton";
import { 
  Bookmark, 
  Calendar, 
  Trash2, 
  ExternalLink,
  Brain,
  BookOpen 
} from "lucide-react";

const DoubtBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      loadBookmarks();
    }
  }, [currentUser]);

  const loadBookmarks = () => {
    const saved = localStorage.getItem(`doubt_bookmarks_${currentUser?.id}`);
    if (saved) {
      setBookmarks(JSON.parse(saved));
    }
  };

  const deleteBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(`doubt_bookmarks_${currentUser?.id}`, JSON.stringify(updated));
    
    toast({
      title: "Bookmark deleted",
      description: "The doubt chain has been removed from your bookmarks"
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getChainDepth = (node: any): number => {
    if (!node.children || node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map(getChainDepth));
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
              <Bookmark className="h-8 w-8 text-yellow-500" />
              <h1 className="text-2xl md:text-3xl font-bold">Saved Doubt Chains</h1>
            </div>
            <p className="text-muted-foreground">
              Revisit your bookmarked learning journeys
            </p>
          </motion.div>

          {/* Bookmarks List */}
          {bookmarks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating doubt chains and bookmark the ones you want to revisit!
              </p>
              <Button onClick={() => navigate('/doubt-chain')}>
                <Brain className="h-4 w-4 mr-2" />
                Create Doubt Chain
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-4 md:gap-6">
              {bookmarks.map((bookmark, index) => (
                <motion.div
                  key={bookmark.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover-glow dark:bg-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base md:text-lg mb-2">
                            {bookmark.originalQuestion}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              {getChainDepth(bookmark.tree)} levels deep
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(bookmark.timestamp)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Navigate to doubt chain with this question pre-filled
                              navigate('/doubt-chain', { 
                                state: { prefilledQuestion: bookmark.originalQuestion }
                              });
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBookmark(bookmark.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        First breakdown: {bookmark.tree.children[0]?.question || 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="flex justify-center mt-8">
            <BackToDashboardButton />
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default DoubtBookmarks;
