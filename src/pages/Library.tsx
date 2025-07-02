import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  Plus,
  FolderPlus,
  Folder,
  Calendar,
  Clock,
  User,
  BookOpen,
  Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useFeatureData } from "@/hooks/useFeatureData";
import { saveStudyMaterial, deleteStudyMaterial } from "@/lib/firebase-db";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";

interface StudyMaterial {
  id: string;
  title: string;
  filename: string;
  fileUrl: string;
  type: string;
  size: number;
  folderId?: string;
  tags: string[];
  created_at: string;
  userId: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  userId: string;
}

const Library = () => {
  const [user] = useAuthState(auth);
  const { toast } = useToast();
  const { uploadFile } = useFirebaseStorage();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);

  const { data: materials, loading: loadingMaterials, refetch: refetchMaterials } = useFeatureData<StudyMaterial>(
    user?.uid || null, 
    'study_materials'
  );
  
  const { data: folders, loading: loadingFolders, refetch: refetchFolders } = useFeatureData<Folder>(
    user?.uid || null, 
    'folders'
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const filePath = `study-materials/${user.uid}/${Date.now()}-${file.name}`;
        const downloadURL = await uploadFile(file, filePath);
        
        await saveStudyMaterial(user.uid, {
          title: file.name.split('.')[0],
          filename: file.name,
          fileUrl: downloadURL,
          type: file.type,
          size: file.size,
          tags: [],
        });
      }
      
      await refetchMaterials();
      toast({
        title: "Success",
        description: "Files uploaded successfully!"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!user) return;
    
    try {
      await deleteStudyMaterial(materialId);
      await refetchMaterials();
      toast({
        title: "Success",
        description: "Material deleted successfully!"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed", 
        description: "Failed to delete material. Please try again.",
        variant: "destructive"
      });
    }
  };

  const createFolder = async () => {
    if (!user || !newFolderName.trim()) return;

    try {
      setIsCreateFolderDialogOpen(false);
      setNewFolderName("");
      setNewFolderDescription("");
      
      toast({
        title: "Folder Created",
        description: `Folder "${newFolderName}" created successfully!`
      });
    } catch (error) {
      console.error('Create folder error:', error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "pdf" && material.type === "application/pdf") ||
                         (selectedFilter === "doc" && material.type.includes("document")) ||
                         (selectedFilter === "image" && material.type.startsWith("image/"));
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => material.tags?.includes(tag));
    
    return matchesSearch && matchesFilter && matchesTags;
  }) || [];

  const allTags = Array.from(new Set(materials?.flatMap(m => m.tags || []) || []));

  if (loadingMaterials || loadingFolders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-400" />
              Study Library
            </h1>
            <p className="text-gray-400">Organize and access all your study materials</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          >
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1A1A1A] border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Upload Study Materials</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload" className="text-gray-300">
                        Select Files (PDF, DOC, Images)
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="bg-[#2A2A2A] border-slate-600 text-white mt-2"
                      />
                    </div>
                    {uploading && (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-2"></div>
                        <p className="text-gray-400">Uploading files...</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1A1A1A] border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="folder-name" className="text-gray-300">Folder Name</Label>
                      <Input
                        id="folder-name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                        className="bg-[#2A2A2A] border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="folder-desc" className="text-gray-300">Description (Optional)</Label>
                      <Input
                        id="folder-desc"
                        value={newFolderDescription}
                        onChange={(e) => setNewFolderDescription(e.target.value)}
                        placeholder="Enter description"
                        className="bg-[#2A2A2A] border-slate-600 text-white"
                      />
                    </div>
                    <Button 
                      onClick={createFolder}
                      disabled={!newFolderName.trim()}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      Create Folder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1A1A1A] border-slate-600 text-white w-full sm:w-64"
                />
              </div>
              
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 bg-[#1A1A1A] border border-slate-600 rounded-md text-white"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="doc">Documents</option>
                <option value="image">Images</option>
              </select>
            </div>
          </motion.div>

          <Tabs defaultValue="materials" className="space-y-6">
            <TabsList className="bg-[#1A1A1A] border border-slate-700">
              <TabsTrigger value="materials" className="data-[state=active]:bg-purple-600">
                Study Materials ({materials?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="folders" className="data-[state=active]:bg-purple-600">
                Folders ({folders?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials" className="space-y-6">
              {allTags.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2"
                >
                  <span className="text-sm text-gray-400 mr-2">Filter by tags:</span>
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${
                        selectedTags.includes(tag)
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "border-slate-600 text-gray-300 hover:bg-slate-800"
                      }`}
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="text-gray-400 hover:text-white"
                    >
                      Clear filters
                    </Button>
                  )}
                </motion.div>
              )}

              {filteredMaterials.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {materials?.length === 0 ? "No materials yet" : "No materials found"}
                  </h3>
                  <p className="text-gray-500">
                    {materials?.length === 0 
                      ? "Upload your first study material to get started"
                      : "Try adjusting your search terms or filters"
                    }
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid gap-4 ${
                    viewMode === "grid" 
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                      : "grid-cols-1"
                  }`}
                >
                  <AnimatePresence>
                    {filteredMaterials.map((material, index) => (
                      <motion.div
                        key={material.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-[#1A1A1A] border-slate-700 hover:border-purple-500 transition-colors group">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-white text-sm font-medium truncate">
                                    {material.title}
                                  </CardTitle>
                                  <p className="text-xs text-gray-400 truncate">
                                    {material.filename}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(material.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {(material.size / 1024).toFixed(1)} KB
                                </div>
                              </div>
                              
                              {material.tags && material.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {material.tags.map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs border-slate-600 text-gray-400">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800"
                                  onClick={() => window.open(material.fileUrl, '_blank')}
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  View
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
            </TabsContent>

            <TabsContent value="folders" className="space-y-6">
              {folders?.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No folders yet</h3>
                  <p className="text-gray-500">Create your first folder to organize your materials</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                  {folders?.map((folder, index) => (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-[#1A1A1A] border-slate-700 hover:border-blue-500 transition-colors group cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                              <Folder className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-white text-sm font-medium truncate">
                                {folder.name}
                              </CardTitle>
                              {folder.description && (
                                <p className="text-xs text-gray-400 truncate">
                                  {folder.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(folder.created_at).toLocaleDateString()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Library;
