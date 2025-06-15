import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FolderOpen,
  FileText,
  BookOpen,
  Plus,
  Filter,
  Grid,
  List,
  Download,
  Eye,
  Trash2,
  Calendar,
  Bug,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserStudyMaterials } from "@/lib/database";
import SupabaseDebugger from "@/components/debug/SupabaseDebugger";

const Library = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);

  // Load user's study materials
  useEffect(() => {
    if (currentUser?.id) {
      loadStudyMaterials();
    }
  }, [currentUser?.id]);

  const loadStudyMaterials = async () => {
    if (!currentUser?.id) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Loading study materials for user:', currentUser.id);
      const data = await getUserStudyMaterials(currentUser.id);
      setMaterials(data || []);
      console.log('✅ Loaded materials:', data?.length || 0);
      
      if (data?.length === 0) {
        toast({
          title: "No materials found",
          description: "Upload your first study material to get started.",
        });
      }
    } catch (error) {
      console.error('❌ Error loading study materials:', error);
      toast({
        title: "Error",
        description: "Failed to load your study materials. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMaterials = materials.filter(material =>
    material.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.file_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (contentType) => {
    if (contentType?.includes('pdf')) return '📄';
    if (contentType?.includes('image')) return '🖼️';
    if (contentType?.includes('text')) return '📝';
    if (contentType?.includes('video')) return '🎥';
    return '📁';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="bg-[#202741] rounded-xl p-6 shadow-lg text-center animate-fade-in">
          <span className="text-3xl">🔒</span>
          <p className="text-lg mt-4">Please sign in to access your library.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold flex items-center gap-3 tracking-tight text-white drop-shadow">
                📚 <BookOpen className="h-10 w-10 text-spark-primary" />
                Your Library
              </h1>
              <Button
                onClick={() => setShowDebugger(!showDebugger)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Bug className="h-4 w-4" />
                {showDebugger ? 'Hide' : 'Show'} Debug
              </Button>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage and organize all your study materials in one place
            </p>
          </div>

          {/* Debug Panel */}
          {showDebugger && (
            <div className="mb-8">
              <SupabaseDebugger />
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in-up">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold">{materials.length}</p>
                    <p className="text-sm text-muted-foreground">Total Materials</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold">
                      {formatFileSize(materials.reduce((total, m) => total + (m.size || 0), 0))}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Size</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold">
                      {materials.filter(m => {
                        const date = new Date(m.created_at);
                        const today = new Date();
                        return date.toDateString() === today.toDateString();
                      }).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Added Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Materials Grid/List */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading your materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <FolderOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                {materials.length === 0 ? "No materials yet" : "No materials found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {materials.length === 0 
                  ? "Upload your first study material to get started"
                  : "Try adjusting your search query"
                }
              </p>
              {materials.length === 0 && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Material
                </Button>
              )}
            </div>
          ) : (
            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
            } animate-fade-in-up`}>
              {filteredMaterials.map((material) => (
                <Card 
                  key={material.id}
                  className="dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none hover:scale-105 transition-transform cursor-pointer"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(material.content_type)}</span>
                        <div>
                          <CardTitle className="text-lg line-clamp-1">{material.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {material.file_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">
                        {formatFileSize(material.size)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(material.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
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

export default Library;
