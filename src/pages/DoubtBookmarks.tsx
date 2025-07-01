import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trash2, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Doubt {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

const DoubtBookmarks = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarkedDoubts();
    }
  }, [user]);

  const fetchBookmarkedDoubts = async () => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        console.error("User ID is missing.");
        toast({
          title: "Error",
          description: "Could not fetch bookmarked doubts. User ID is missing.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("doubt_bookmarks")
        .select(
          `
          id,
          doubts (
            id,
            title,
            content,
            created_at
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookmarked doubts:", error);
        toast({
          title: "Error",
          description:
            "Failed to load bookmarked doubts. Please check console for details.",
          variant: "destructive",
        });
        return;
      }

      // Extract the doubt data from the nested structure
      const formattedDoubts = data.map((item) => ({
        id: item.doubts.id,
        title: item.doubts.title,
        content: item.doubts.content,
        created_at: item.doubts.created_at,
      }));

      setDoubts(formattedDoubts);
    } catch (error) {
      console.error("Error fetching doubts:", error);
      toast({
        title: "Error",
        description:
          "Failed to load doubts. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      const { error } = await supabase
        .from("doubt_bookmarks")
        .delete()
        .eq("id", bookmarkId);

      if (error) {
        console.error("Error deleting bookmark:", error);
        toast({
          title: "Error",
          description: "Failed to delete bookmark. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Optimistically update the UI by removing the deleted bookmark
      setDoubts((prevDoubts) => prevDoubts.filter((doubt) => doubt.id !== bookmarkId));

      toast({
        title: "Success",
        description: "Bookmark deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to delete bookmark. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow">
              📌 Your Bookmarked Doubts
            </h1>
            <p className="text-muted-foreground text-lg">
              Quickly access the doubts you've saved for later
            </p>
          </div>

          {/* Doubt List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your bookmarked doubts...</p>
            </div>
          ) : doubts.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                No doubts bookmarked yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Bookmark doubts to easily find them later
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {doubts.map((doubt) => (
                <Card
                  key={doubt.id}
                  className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">
                      {doubt.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doubt.content}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">
                        <Calendar className="mr-1 inline-block h-4 w-4" />
                        {new Date(doubt.created_at).toLocaleDateString()}
                        <Clock className="mr-1 ml-2 inline-block h-4 w-4" />
                        {new Date(doubt.created_at).toLocaleTimeString()}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBookmark(doubt.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default DoubtBookmarks;
