
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share, CreditCard, MessageCircle, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";

const ChatHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="bg-[#0A0A0A] border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Session info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            <span className="text-white font-medium">New Chat Session</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                Chat History
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <DropdownMenuItem className="text-gray-300 hover:text-white">
                Previous Session 1
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white">
                Previous Session 2
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Badge variant="outline" className="text-orange-400 border-orange-400">
            🔥 1
          </Badge>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-white border-gray-600 hover:bg-gray-800"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={handleUpgrade}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Upgrade
            </Button>
          </motion.div>

          <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-gray-600 hover:bg-gray-800"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Feedback
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Help us improve Tutorly by sharing your thoughts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Subject"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Textarea
                  placeholder="Your feedback..."
                  className="bg-gray-800 border-gray-600 text-white min-h-[100px]"
                />
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Send Feedback
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700" align="end">
              <DropdownMenuItem 
                className="text-gray-300 hover:text-white"
                onClick={() => navigate('/profile')}
              >
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-gray-300 hover:text-white"
                onClick={() => navigate('/pricing')}
              >
                Subscription
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
