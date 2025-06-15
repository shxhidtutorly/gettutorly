
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
  FilePdf,
  FileSpreadsheet
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
      case 'pdf': return FilePdf;
      case 'doc': return FileText;
      case 'excel': return FileSpreadsheet;
      default: return FileImage;
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-[#111111] border-r border-gray-800 flex flex-col h-full relative"
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 bg-[#111111] border border-gray-800 h-6 w-6 rounded-full hover:bg-gray-800"
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
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-white font-bold text-lg">Tutorly</span>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.href} to={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-purple-600/20 text-purple-400 border border-purple-600/30" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium"
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
              <h3 className="text-sm font-medium text-gray-300">Your Notes</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Upload className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
            
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {mockFiles.map((file, index) => {
                const Icon = getFileIcon(file.type);
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02, backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-300 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatSidebar;
