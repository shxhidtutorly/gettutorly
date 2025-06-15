
import { Button } from '@/components/ui/button';
import { 
  Share, 
  Crown, 
  MessageCircle, 
  User,
  ChevronDown 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const ChatHeader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border-b border-gray-800 px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center"
        >
          <span className="text-white font-bold text-lg">🤖</span>
        </motion.div>
        <div>
          <h1 className="text-white font-bold text-xl">Hi, I'm TutorBot</h1>
          <p className="text-gray-400 text-sm">Your AI learning assistant</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111111] border-gray-800">
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
              Subscription
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
