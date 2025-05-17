
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

const Library = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [materials, setMaterials] = useState([
    { id: 1, title: "Psychology 101 Notes", type: "pdf", date: "Apr 20, 2025", bookmarked: true },
    { id: 2, title: "History of Science Chapter 3", type: "pdf", date: "Apr 18, 2025", bookmarked: false },
    { id: 3, title: "Calculus Formulas", type: "docx", date: "Apr 15, 2025", bookmarked: true },
    { id: 4, title: "English Literature Essay", type: "docx", date: "Apr 10, 2025", bookmarked: false },
    { id: 5, title: "Chemistry Lab Report", type: "pdf", date: "Apr 5, 2025", bookmarked: false }
  ]);
  
  const [folders, setFolders] = useState([
    { id: 1, name: "Biology", description: "All biology course materials", itemCount: 3 },
    { id: 2, name: "Chemistry", description: "Chemistry notes and quizzes", itemCount: 5 }
  ]);
  
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleBookmark = (id) => {
    setMaterials(materials.map(material => 
      material.id === id 
        ? { ...material, bookmarked: !material.bookmarked } 
        : material
    ));
    
    const material = materials.find(m => m.id === id);
    
    toast({
      title: material.bookmarked 
        ? "Removed from bookmarks" 
        : "Added to bookmarks",
      description: `"${material.title}" has been ${material.bookmarked ? 'removed from' : 'added to'} your bookmarks.`
    });
  };

  const handleCreateFolder = (folderData) => {
    const newFolder = {
      id: folders.length + 1,
      name: folderData.name,
      description: folderData.description,
      itemCount: 0
    };
    
    setFolders([...folders, newFolder]);
  };
  
  const handleUploadMaterial = () => {
    setShowUploader(true);
  };
  
  const filteredMaterials = searchTerm 
    ? materials.filter(material => 
        material.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : materials;
    
  const filteredFolders = searchTerm
    ? folders.filter(folder =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        folder.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : folders;
    
  // Helper function to parse dates for comparison
  const parseDateForSort = (dateStr: string) => {
    const [month, day, year] = dateStr.split(" ");
    const monthMap: Record<string, number> = {
      "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
      "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
    };
    return new Date(parseInt(year), monthMap[month], parseInt(day));
  };
  
  const renderMaterials = (items) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((material) => (
        <Card key={material.id} className="hover-glow overflow-hidden dark:bg-card">
          <CardContent className="p-0">
            <div className="p-4 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${material.type === 'pdf' ? 'bg-spark-peach' : 'bg-spark-blue'}`}>
                <FileText className={`h-6 w-6 ${material.type === 'pdf' ? 'text-orange-600' : 'text-blue-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-2">{material.title}</h3>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Uploaded {material.date}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 animated-button"
                onClick={() => handleBookmark(material.id)}
              >
                <Bookmark className={`h-4 w-4 ${material.bookmarked ? 'fill-spark-primary stroke-spark-primary' : 'stroke-muted-foreground'}`} />
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
                      onChange={handleSearch}
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
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg dark:bg-muted"></div>
                      ))}
                    </div>
                  ) : filteredMaterials.length > 0 ? (
                    renderMaterials(filteredMaterials)
                  ) : (
                    <div className="text-center py-12">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No matching materials found</h3>
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
                  {isLoading ? (
                    <div className="animate-pulse h-32 bg-gray-200 rounded-lg dark:bg-muted"></div>
                  ) : (
                    renderMaterials(materials.filter(m => m.bookmarked))
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="mt-6">
                  {isLoading ? (
                    <div className="animate-pulse h-32 bg-gray-200 rounded-lg dark:bg-muted"></div>
                  ) : (
                    renderMaterials([...materials].sort((a, b) => {
                      const dateA = parseDateForSort(a.date);
                      const dateB = parseDateForSort(b.date);
                      return dateB.getTime() - dateA.getTime();  // Sort in descending order (newest first)
                    }))
                  )}
                </TabsContent>
                
                <TabsContent value="folders" className="mt-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg dark:bg-muted"></div>
                      ))}
                    </div>
                  ) : filteredFolders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredFolders.map((folder) => (
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
                      
                      <Card 
                        className="flex items-center justify-center h-[160px] border-dashed cursor-pointer hover:bg-spark-light/20 transition-colors"
                        onClick={() => document.getElementById('create-folder-trigger')?.click()}
                      >
                        <div className="text-center p-4">
                          <div className="w-12 h-12 rounded-full bg-spark-light flex items-center justify-center mx-auto mb-2">
                            <Plus className="h-6 w-6 text-spark-primary" />
                          </div>
                          <p className="font-medium">Create New Folder</p>
                        </div>
                        <div className="hidden">
                          <CreateFolderDialog 
                            onFolderCreate={handleCreateFolder}
                            trigger={<button id="create-folder-trigger">Create</button>}
                          />
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No folders found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchTerm 
                          ? `We couldn't find any folders matching "${searchTerm}"` 
                          : "You haven't created any folders yet. Create one to organize your materials."}
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
