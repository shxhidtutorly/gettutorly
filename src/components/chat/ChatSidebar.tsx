
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Brain, 
  TestTube, 
  BookOpen, 
  FileText, 
  Mic, 
  BarChart3, 
  Upload, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FileSpreadsheet,
  File,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const navigationItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: MessageSquare, label: 'Chat', href: '/chat' },
  { icon: Brain, label: 'Flashcards', href: '/flashcards' },
  { icon: TestTube, label: 'Tests & Quizzes', href: '/quiz' },
  { icon: Brain, label: 'AI Tutor', href: '/ai-assistant' },
  { icon: FileText, label: 'Summaries', href: '/summaries' },
  { icon: BookOpen, label: 'Notes & Materials', href: '/library' },
  { icon: Brain, label: 'AI Explainers', href: '/ai-notes' },
  { icon: Mic, label: 'Audio Recap', href: '/audio-notes' },
  { icon: BarChart3, label: 'Insights', href: '/progress' },
  { icon: Upload, label: 'Uploads', href: '/library' },
  { icon: Settings, label: 'Settings', href: '/profile' },
];

const mockFiles = [
  { name: 'Machine Learning Notes.pdf', type: 'pdf', size: '2.4 MB' },
  { name: 'Psychology Chapter 1.docx', type: 'doc', size: '1.2 MB' },
  { name: 'Statistics Formulas.xlsx', type: 'excel', size: '800 KB' },
];

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({ isCollapsed, onToggle }: ChatSidebarProps) => {
  const location = useLocation();

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return File;
      case 'doc':
        return FileText;
      case 'excel':
        return FileSpreadsheet;
      default:
        return FileImage;
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-[#111111] border-r border-gray-800 flex flex-col h-full relative shadow-xl"
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 bg-[#111111] border border-gray-800 h-6 w-6 rounded-full hover:bg-gray-800 shadow-lg"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3 text-gray-400" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-gray-400" />
        )}
      </Button>

      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <motion.div
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3"
        >
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="h-6 w-6 text-white" />
          </motion.div>
          {!isCollapsed && (
            <div>
              <span className="text-white font-bold text-xl">Tutorly</span>
              <p className="text-gray-400 text-xs">AI Learning Assistant</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group cursor-pointer",
                  isActive 
                    ? "bg-gradient-to-r from-purple-600/20 to-purple-700/20 text-purple-300 border border-purple-600/30 shadow-lg" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60 hover:shadow-md",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  isActive ? "text-purple-400" : "text-gray-400 group-hover:text-white",
                  isCollapsed ? "h-6 w-6" : "h-5 w-5"
                )} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Your Notes Section */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-800 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200">Your Notes</h3>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-lg hover:bg-purple-600/20 hover:text-purple-400"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {mockFiles.map((file, index) => {
                const Icon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(75, 85, 99, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-700"
                  >
                    <Icon className="h-4 w-4 text-purple-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-200 truncate font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </motion.div>
  );
};

export default ChatSidebar;
