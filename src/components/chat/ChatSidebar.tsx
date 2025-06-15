
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  CreditCard, 
  Calendar,
  BarChart3,
  FileText,
  Upload,
  Settings,
  Brain,
  Headphones,
  TestTube,
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  File,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarItem {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string;
}

const mainNavItems: SidebarItem[] = [
  { title: 'Home', icon: Home, path: '/dashboard' },
  { title: 'Chat', icon: MessageSquare, path: '/chat' },
  { title: 'Flashcards', icon: CreditCard, path: '/flashcards' },
  { title: 'Tests & Quizzes', icon: TestTube, path: '/quiz' },
  { title: 'AI Tutor', icon: Brain, path: '/ai-assistant' },
  { title: 'Summaries', icon: BookOpen, path: '/summaries' },
  { title: 'Notes & Materials', icon: FileText, path: '/library' },
  { title: 'AI Explainers', icon: Brain, path: '/study-techniques' },
  { title: 'Audio Recap', icon: Headphones, path: '/audio-notes' },
  { title: 'Insights', icon: BarChart3, path: '/progress' },
  { title: 'Uploads', icon: Upload, path: '/ai-notes' },
  { title: 'Settings', icon: Settings, path: '/profile' },
];

const mockNotes = [
  { name: 'Untitled Document', type: 'doc' },
  { name: 'UNIT 2 PART 02.pdf', type: 'pdf' },
];

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div
      className={`bg-[#0A0A0A] border-r border-gray-800 flex flex-col h-full transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-white font-bold text-lg">Tutorly</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-10 px-3 text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors ${
                    isActive ? 'bg-purple-600/20 text-purple-400 border-r-2 border-purple-500' : ''
                  } ${isCollapsed ? 'px-2' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="text-sm">{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        {!isCollapsed && (
          <>
            <Separator className="my-4 bg-gray-800" />
            
            {/* Your Notes Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-3">
                <span className="text-sm font-medium text-gray-400">Your Notes</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                {mockNotes.map((note, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md cursor-pointer transition-colors"
                  >
                    {note.type === 'pdf' ? (
                      <File className="h-4 w-4 text-red-400" />
                    ) : (
                      <FileImage className="h-4 w-4 text-blue-400" />
                    )}
                    <span className="truncate">{note.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </ScrollArea>

      {/* Bottom Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-800">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <BookOpen className="h-4 w-4 mr-2" />
            Tutorials
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default ChatSidebar;
