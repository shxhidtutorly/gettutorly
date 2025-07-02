import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FolderPlus,
  File,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  Sparkles,
  Folder,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirebaseStorage } from "@/hooks/useFirebaseStorage";
import { supabase } from "@/integrations/supabase/client";

interface StudyMaterial {
  id: string;
  title: string;
  file_name: string;
  file_url: string;
  folder_id: string | null;
  created_at: string;
}

interface Folder {
  id: string;
  name: string;
  created_at: string;
}

const Library = () => {
  const { user, isLoaded } = useUser();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { upload } = useStorage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMaterials = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let { data: study_materials, error } = await supabase
        .from("study_materials")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching materials:", error);
        toast({
          title: "Error",
          description: "Failed to load materials. Please check console for details.",
          variant: "destructive",
        });
        return;
      }

      setMaterials(study_materials || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast({
        title: "Error",
        description: "Failed to load materials. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const fetchFolders = useCallback(async () => {
    if (!user) return;

    try {
      let { data: folders_data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching folders:", error);
        toast({
          title: "Error",
          description: "Failed to load folders. Please check console for details.",
          variant: "destructive",
        });
        return;
      }

      setFolders(folders_data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast({
        title: "Error",
        description: "Failed to load folders. Please check console for details.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchMaterials();
      fetchFolders();
    }
  }, [user, fetchMaterials, fetchFolders]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      const filePath = `users/${user.id}/library/${selectedFile.name}`;
      const fileUrl = await upload(filePath, selectedFile);

      const { data, error } = await supabase.from("study_materials").insert([
        {
          user_id: user.id,
          title: selectedFile.name,
          file_name: selectedFile.name,
          file_url: fileUrl,
          folder_id: selectedFolder,
        },
      ]);

      if (error) {
        console.error("Error uploading material:", error);
        toast({
          title: "Error",
          description: "Failed to upload material. Please try again.",
          variant: "destructive",
        });
        return;
      }

      fetchMaterials();
      setShowUploader(false);
      setSelectedFile(null);
      setSelectedFolder(null);
      toast({
        title: "Success",
        description: "Material uploaded successfully!",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload material. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !user) return;

    try {
      const { data, error } = await supabase.from("folders").insert([
        {
          user_id: user.id,
          name: newFolderName.trim(),
        },
      ]);

      if (error) {
        console.error("Error creating folder:", error);
        toast({
          title: "Error",
          description: "Failed to create folder. Please try again.",
          variant: "destructive",
        });
        return;
      }

      fetchFolders();
      setShowCreateFolder(false);
      setNewFolderName("");
      toast({
        title: "Success",
        description: "Folder created successfully!",
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from("study_materials")
        .delete()
        .eq("id", materialId);

      if (error) {
        console.error("Error deleting material:", error);
        toast({
          title: "Error",
          description: "Failed to delete material. Please try again.",
          variant: "destructive",
        });
        return;
      }

      fetchMaterials();
      toast({
        title: "Success",
        description: "Material deleted successfully!",
      });
    } catch (error) {
      console.error("Error deleting material:", error);
      toast({
        title: "Error",
        description: "Failed to delete material. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMaterials = selectedFolder
    ? materials.filter((material) => material.folder_id === selectedFolder)
    : materials;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#15192b] via-[#161c29] to-[#1b2236] text-white">
      <Navbar />

      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold tracking-tight text-white">
              📚 Your Library
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage and organize your study materials
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowUploader(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setShowCreateFolder(true)}
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => navigate('/ai-notes')}
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Notes
              </Button>
            </motion.div>
          </div>

          {/* Folder Selection */}
          <div className="mb-6">
            <Label htmlFor="folder" className="text-sm font-medium block mb-2">
              Select Folder:
            </Label>
            <select
              id="folder"
              className="bg-background border-input rounded-md py-2 px-3 text-white w-full"
              value={selectedFolder || ""}
              onChange={(e) =>
                setSelectedFolder(e.target.value === "" ? null : e.target.value)
              }
            >
              <option value="">All Materials</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Materials List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                No materials found in this folder.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <motion.div
                  key={material.id}
                  className="bg-card border-border rounded-md shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <File className="h-5 w-5 text-muted-foreground" />
                          <p className="text-sm font-medium">{material.title}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => window.open(material.file_url, "_blank")}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/ai-notes?fileUrl=${material.file_url}`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit with AI
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/notes-chat/${material.id}`)
                              }
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Chat with Note
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-start">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-background border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete
                                      the material from our servers.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteMaterial(material.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploaded on {new Date(material.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />

      {/* Upload Material Modal */}
      {showUploader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            className="bg-background border-border rounded-lg p-8 max-w-md w-full"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <h2 className="text-2xl font-bold mb-4">Upload Material</h2>
            <Label htmlFor="material" className="text-sm font-medium block mb-2">
              Select File:
            </Label>
            <Input
              type="file"
              id="material"
              onChange={handleFileSelect}
              className="bg-background border-input rounded-md py-2 px-3 text-white w-full"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected file: {selectedFile.name}
              </p>
            )}

            <Label htmlFor="folder" className="text-sm font-medium block mt-4 mb-2">
              Select Folder:
            </Label>
            <select
              id="folder"
              className="bg-background border-input rounded-md py-2 px-3 text-white w-full"
              value={selectedFolder || ""}
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              <option value="">No Folder</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="secondary" onClick={() => setShowUploader(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? (
                  <>
                    Uploading...
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            className="bg-background border-border rounded-lg p-8 max-w-md w-full"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <h2 className="text-2xl font-bold mb-4">Create New Folder</h2>
            <Label htmlFor="folderName" className="text-sm font-medium block mb-2">
              Folder Name:
            </Label>
            <Input
              type="text"
              id="folderName"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="bg-background border-input rounded-md py-2 px-3 text-white w-full"
            />
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="secondary" onClick={() => setShowCreateFolder(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Library;
