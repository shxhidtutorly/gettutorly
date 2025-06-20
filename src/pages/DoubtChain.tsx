import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from "@clerk/clerk-react";
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Bookmark,
  MessageSquare,
  Search,
  Plus,
  Share2,
  ChevronDown,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNav from '@/components/layout/BottomNav';

const DoubtChain = () => {
  const [doubts, setDoubts] = useState<any[]>([]);
  const [bookmarkedDoubts, setBookmarkedDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const { toast } = useToast();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedDoubtId, setSelectedDoubtId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDoubtTitle, setNewDoubtTitle] = useState("");
  const [newDoubtContent, setNewDoubtContent] = useState("");

  const loadDoubts = async () => {
    setLoading(true);
    // Placeholder for fetching doubts from database
    const fetchedDoubts = [
      {
        id: "1",
        title: "Understanding Quantum Entanglement",
        content: "Can someone explain quantum entanglement in simple terms? I'm struggling to grasp the concept.",
        replies: 5,
        bookmarks: 2,
        createdAt: "2024-01-25T12:00:00Z",
        bookmarked: true
      },
      {
        id: "2",
        title: "The Role of Mitochondria in Cellular Respiration",
        content: "I'm confused about the exact role of mitochondria in cellular respiration. How do they generate ATP?",
        replies: 3,
        bookmarks: 1,
        createdAt: "2024-01-24T18:30:00Z",
        bookmarked: false
      },
    ];
    setDoubts(fetchedDoubts);
    setBookmarkedDoubts(fetchedDoubts.filter(doubt => doubt.bookmarked));
    setLoading(false);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredDoubts = doubts.filter(doubt =>
    doubt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doubt.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = (doubtId: string) => {
    setSelectedDoubtId(doubtId);
    setIsShareModalOpen(true);
  };

  const handleCopyLink = () => {
    const doubtLink = `${window.location.origin}/doubts/${selectedDoubtId}`;
    navigator.clipboard.writeText(doubtLink)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error("Could not copy link:", err));
  };

  const handleCreateDoubt = async () => {
    if (!newDoubtTitle || !newDoubtContent) {
      toast({
        title: "Error",
        description: "Title and content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    // Placeholder for saving the new doubt to the database
    const newDoubt = {
      id: Date.now().toString(),
      title: newDoubtTitle,
      content: newDoubtContent,
      replies: 0,
      bookmarks: 0,
      createdAt: new Date().toISOString(),
      bookmarked: false
    };

    setDoubts([newDoubt, ...doubts]);
    setNewDoubtTitle("");
    setNewDoubtContent("");
    setIsCreateModalOpen(false);

    toast({
      title: "Success",
      description: "New doubt created successfully.",
    });
  };

  useEffect(() => {
    if (user?.id) {
      loadDoubts();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Doubt Chain</h1>
          <Input
            type="text"
            placeholder="Search doubts..."
            className="bg-white/10 border-white/20 text-white w-64"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Recent Doubts</h2>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Doubt
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Doubt</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Share your doubts and get help from the community.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  className="bg-gray-800 border-gray-600 text-white"
                  value={newDoubtTitle}
                  onChange={(e) => setNewDoubtTitle(e.target.value)}
                />
                <Input
                  placeholder="Content"
                  className="bg-gray-800 border-gray-600 text-white"
                  value={newDoubtContent}
                  onChange={(e) => setNewDoubtContent(e.target.value)}
                />
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleCreateDoubt}>
                  Create Doubt
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center">Loading doubts...</div>
        ) : (
          <div className="space-y-4">
            {filteredDoubts.map(doubt => (
              <Card key={doubt.id} className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    {doubt.title}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-gray-400 hover:text-white">
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700">
                        <DropdownMenuItem className="text-gray-300 hover:text-white">
                          View Doubt
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white" onClick={() => handleShare(doubt.id)}>
                          Share Doubt
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:text-white">
                          Report Doubt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardTitle>
                  <CardDescription className="text-gray-400">{doubt.content.substring(0, 100)}...</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{doubt.replies} Replies</span>
                    <Bookmark className="w-4 h-4" />
                    <span>{doubt.bookmarks} Bookmarks</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created at {new Date(doubt.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Share Doubt</DialogTitle>
            <DialogDescription className="text-gray-400">
              Share this doubt with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={`${window.location.origin}/doubts/${selectedDoubtId}`}
              className="bg-gray-800 border-gray-600 text-white"
              readOnly
            />
            <Button className="w-full bg-purple-600 hover:bg-purple-700 relative" onClick={handleCopyLink} disabled={isCopied}>
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default DoubtChain;
