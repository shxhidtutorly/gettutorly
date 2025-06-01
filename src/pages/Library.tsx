
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpenText, 
  Search, 
  FileText, 
  Bookmark,
  Filter, 
  MoreVertical,
  Clock,
  Plus,
  Folder
} from "lucide-react";
import CreateFolderDialog from "@/components/features/CreateFolderDialog";
import DocumentUploader from "@/components/features/DocumentUploader";
import { useRealTimeStudyMaterials } from "@/hooks/useRealTimeData";
import { useAuth } from "@/contexts/AuthContext";
import { searchStudyMaterials } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";

const Library = () => {
  const { currentUser } = useAuth();
  const { materials, loading } = useRealTimeStudyMaterials();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState(new Set());
  const [folders, setFolders] = useState([]);
  
  const { toast } = useToast();
  
  // Search functionality
  useEffect(() => {
    if (searchTerm && currentUser) {
      const performSearch = async () => {
        try {
          const results = await searchStudyMaterials(searchTerm, currentUser.id);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        }
      };
      
      const timeoutId = setTimeout(performSearch, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, currentUser]);
  
  const handleBookmark = async (materialId: string) => {
    try {
      const isBookmarked = bookmarkedMaterials.has(materialId);
      
      if (isBookmarked) {
        setBookmarkedMaterials(prev => {
          const newSet = new Set(prev);
          newSet.delete(materialId);
          return newSet;
        });
      } else {
        setBookmarkedMaterials(prev => new Set(prev).add(materialId));
      }
      
      // Log the bookmark action
      await supabase.rpc('log_user_activity', {
        action_type: isBookmarked ? 'material_unbookmarked' : 'material_bookmarked',
        activity_details: { material_id: materialId }
      });
      
      toast({
        title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
        description: "Bookmark updated successfully"
      });
    } catch (error) {
      console.error('Bookmark error:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive"
      });
    }
  };

  const handleCreateFolder = (folderData: { name: string; description: string }) => {
    const newFolder = {
      id: folders.length + 1,
      name: folderData.name,
      description: folderData.description,
      itemCount: 0
    };
    
    setFolders([...folders, newFolder]);
    toast({
      title: "Folder created",
      description: `"${folderData.name}" folder has been created successfully.`
    });
  };
  
  const handleUploadMaterial = () => {
    setShowUploader(true);
  };
  
  const materialsToShow = searchTerm ? searchResults : materials;
  
  const renderMaterials = (items: any[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((material) => (
        <Card key={material.id} className="hover-glow overflow-hidden dark:bg-card">
          <CardContent className="p-0">
            <div className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${material.content_type?.includes('pdf') ? 'bg-spark-peach' : 'bg-spark-blue'}`}>
                <FileText className={`h-6 w-6 ${material.content_type?.includes('pdf') ? 'text-orange-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-2">{material.title}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Uploaded {new Date(material.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 animated-button"
                onClick={() => handleBookmark(material.id)}
              >
                <Bookmark className={`h-4 w-4 ${bookmarkedMaterials.has(material.id) ? 'fill-spark-primary stroke-spark-primary' : 'stroke-muted-foreground'}`} />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 p-2 flex justify-between dark:bg-muted">
            <Button variant="ghost" size="sm" className="animated-button">Open</Button>
            <Button variant="ghost" size="sm" className="animated-button">Share</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  if (!currentUser) {
    return <div>Please sign in to access your library.</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {showUploader ? (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUploader(false)}
                  className="flex items-center gap-2"
                >
                  <BookOpenText className="h-5 w-5 mr-1" />
                  Back to Library
                </Button>
              </div>
              <DocumentUploader />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                    <BookOpenText className="h-7 w-7 text-spark-primary" />
                    Your Library
                  </h1>
                  <p className="text-muted-foreground">All your study materials in one place</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search materials..."
                      className="pl-9 dark:bg-muted dark:border-muted"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="animated-button dark:border-muted">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between">
                  <TabsList className="dark:bg-muted">
                    <TabsTrigger value="all">All Materials</TabsTrigger>
                    <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                    <TabsTrigger value="folders">Folders</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex items-center gap-2">
                    <CreateFolderDialog onFolderCreate={handleCreateFolder} />
                    <Button size="sm" className="animated-button" onClick={handleUploadMaterial}>
                      <Plus className="h-4 w-4 mr-1" />
                      Upload Material
                    </Button>
                  </div>
                </div>
                
                <TabsContent value="all" className="mt-6">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg dark:bg-muted"></div>
                      ))}
                    </div>
                  ) : materialsToShow.length > 0 ? (
                    renderMaterials(materialsToShow)
                  ) : (
                    <div className="text-center py-12">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No materials found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchTerm 
                          ? `We couldn't find any materials matching "${searchTerm}"` 
                          : "Your library is empty. Upload materials to get started."}
                      </p>
                      <Button className="animated-button" onClick={handleUploadMaterial}>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Materials
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="bookmarked" className="mt-6">
                  {loading ? (
                    <div className="animate-pulse h-32 bg-gray-200 rounded-lg dark:bg-muted"></div>
                  ) : (
                    renderMaterials(materials.filter(m => bookmarkedMaterials.has(m.id)))
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="mt-6">
                  {loading ? (
                    <div className="animate-pulse h-32 bg-gray-200 rounded-lg dark:bg-muted"></div>
                  ) : (
                    renderMaterials([...materials].sort((a, b) => 
                      new Date(b.updated_at || b.created_at).getTime() - 
                      new Date(a.updated_at || a.created_at).getTime()
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="folders" className="mt-6">
                  {folders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {folders.map((folder) => (
                        <Card key={folder.id} className="hover-glow overflow-hidden dark:bg-card">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-spark-light">
                                <Folder className="h-6 w-6 text-spark-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium">{folder.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {folder.description || "No description"}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground mt-2">
                                  <span>{folder.itemCount} {folder.itemCount === 1 ? 'item' : 'items'}</span>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/50 p-2 flex justify-between dark:bg-muted">
                            <Button variant="ghost" size="sm" className="animated-button">Open</Button>
                            <Button variant="ghost" size="sm" className="animated-button">Share</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No folders found</h3>
                      <p className="text-muted-foreground mb-6">
                        You haven't created any folders yet. Create one to organize your materials.
                      </p>
                      <CreateFolderDialog 
                        onFolderCreate={handleCreateFolder}
                        trigger={<Button className="animated-button"><Plus className="h-4 w-4 mr-2" />Create Folder</Button>}
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Library;
