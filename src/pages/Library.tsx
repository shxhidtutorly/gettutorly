import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNav from "@/components/layout/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, File, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Copy, Download, Share2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  file: z.any(),
});

const Library = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [files, setFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    uploadFile,
    deleteFile,
    getSignedUrl,
    listFiles,
    progress,
    error,
  } = useSupabaseStorage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      file: null,
    },
  });

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      const fetchedFiles = await listFiles();
      setFiles(fetchedFiles || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to load files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUploading(true);
    try {
      if (!values.file) {
        throw new Error("Please select a file to upload.");
      }

      const uploadResult = await uploadFile(values.file);

      if (uploadResult) {
        toast({
          title: "Success",
          description: "File uploaded successfully.",
        });
        form.reset();
        fetchFiles();
      } else {
        toast({
          title: "Error",
          description: "File upload failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Error",
        description: error.message || "File upload failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileAction = async (
    file: any,
    action: "preview" | "download" | "copy" | "share" | "delete"
  ) => {
    try {
      const filePath = file.name;

      switch (action) {
        case "preview":
          const signedUrl = await getSignedUrl(filePath);
          if (signedUrl) {
            setSelectedFileUrl(signedUrl);
            window.open(signedUrl, "_blank");
          } else {
            toast({
              title: "Error",
              description: "Could not generate preview URL.",
              variant: "destructive",
            });
          }
          break;
        case "download":
          const downloadUrl = await getSignedUrl(filePath);
          if (downloadUrl) {
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            toast({
              title: "Error",
              description: "Could not generate download URL.",
              variant: "destructive",
            });
          }
          break;
        case "copy":
          const copyUrl = await getSignedUrl(filePath);
          if (copyUrl) {
            navigator.clipboard.writeText(copyUrl);
            toast({
              title: "Success",
              description: "URL copied to clipboard!",
            });
          } else {
            toast({
              title: "Error",
              description: "Could not generate URL to copy.",
              variant: "destructive",
            });
          }
          break;
        case "share":
          const shareUrl = await getSignedUrl(filePath);
          if (shareUrl) {
            navigator.share({
              title: `Check out this file: ${file.name}`,
              url: shareUrl,
            });
          } else {
            toast({
              title: "Error",
              description: "Could not generate share URL.",
              variant: "destructive",
            });
          }
          break;
        case "delete":
          const confirmDelete = window.confirm(
            "Are you sure you want to delete this file?"
          );
          if (confirmDelete) {
            const success = await deleteFile(file.name);
            if (success) {
              toast({
                title: "Success",
                description: "File deleted successfully.",
              });
              fetchFiles();
            } else {
              toast({
                title: "Error",
                description: "Failed to delete file.",
                variant: "destructive",
              });
            }
          }
          break;
      }
    } catch (error: any) {
      console.error("File action error:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to perform action.`,
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow">
                  📚 Your Library
                </h1>
                <p className="text-muted-foreground text-lg">
                  Manage and access your uploaded study materials
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Upload Study Material</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Upload a new PDF file to your library.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="My Awesome Study Material"
                                className="bg-gray-800 border-gray-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="A brief description of the material"
                                className="bg-gray-800 border-gray-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="file"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>File</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept=".pdf"
                                className="bg-gray-800 border-gray-600 text-white file:bg-gray-700 file:border-0 file:text-white file:py-2 file:px-4"
                                onChange={(e) => {
                                  const file = (e.target as HTMLInputElement)
                                    .files?.[0];
                                  field.onChange(file);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {isUploading && (
                        <div className="w-full">
                          <Progress value={progress} />
                          <p className="text-sm text-muted-foreground mt-1">
                            Uploading... {progress}%
                          </p>
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={isUploading}
                        className="w-full bg-primary hover:bg-primary-foreground text-white"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                          </>
                        ) : (
                          "Upload"
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* File List */}
          {files.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                No files uploaded yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start building your library by uploading your study materials
              </p>
            </div>
          ) : (
            <ScrollArea className="rounded-md border dark:bg-gradient-to-br dark:from-[#23294b] dark:via-[#191e32] dark:to-[#23294b] bg-card shadow-lg rounded-xl border-none">
              <Table>
                <TableCaption>
                  A list of your uploaded study materials.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">File Name</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">{file.name}</TableCell>
                      <TableCell>
                        {new Date(file.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleFileAction(file, "preview")}
                            >
                              <File className="mr-2 h-4 w-4" /> Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleFileAction(file, "download")}
                            >
                              <Download className="mr-2 h-4 w-4" /> Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleFileAction(file, "copy")}
                            >
                              <Copy className="mr-2 h-4 w-4" /> Copy URL
                            </DropdownMenuItem>
                            {navigator.share && (
                              <DropdownMenuItem
                                onClick={() => handleFileAction(file, "share")}
                              >
                                <Share2 className="mr-2 h-4 w-4" /> Share
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleFileAction(file, "delete")}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Library;
