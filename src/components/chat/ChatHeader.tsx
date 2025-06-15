
import { Button } from '@/components/ui/button';
import { 
  Share, 
  Crown, 
  MessageCircle, 
  User,
  ChevronDown,
  Bot,
  Sparkles 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const ChatHeader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A] border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-lg"
    >
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="h-7 w-7 text-white" />
          </div>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>
        </motion.div>
        <div>
          <h1 className="text-white font-bold text-xl">Hi, I'm TutorBot</h1>
          <p className="text-gray-400 text-sm">Your AI learning assistant • Online</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-200 rounded-lg px-4 py-2"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-purple-600/50 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 hover:border-purple-500 transition-all duration-200 rounded-lg px-4 py-2"
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-200 rounded-lg px-4 py-2"
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
                className="text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-200 rounded-lg px-4 py-2"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1A1A1A] border-gray-700 shadow-xl rounded-xl p-2 w-48">
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg px-3 py-2 cursor-pointer transition-colors">
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg px-3 py-2 cursor-pointer transition-colors">
              Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700 my-1" />
            <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800/60 rounded-lg px-3 py-2 cursor-pointer transition-colors">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
