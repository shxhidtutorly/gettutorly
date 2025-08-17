// src/components/MindMap.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLanguage } from '@/hooks/useUserLanguage';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Plus, 
  Edit, 
  Trash2,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';


interface MindMapNode {
  id: string;
  title: string;
  children: MindMapNode[];
  position?: { x: number; y: number };
  color?: string;
}

interface MindMapProps {
  className?: string;
}

const MindMap: React.FC<MindMapProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language } = useUserLanguage();
  
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'add' | 'edit' | 'delete'>('add');
  const [editText, setEditText] = useState('');
  const [parentNode, setParentNode] = useState<MindMapNode | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Color palette for nodes
  const nodeColors = [
    '#e8f5e8', // soft green
    '#e8f4fd', // soft blue
    '#fde8f8', // soft pink
    '#f0e8fd', // soft purple
    '#fff8e8', // soft yellow
    '#f8e8e8', // soft gray
  ];

  // Load mind map from localStorage
  useEffect(() => {
    if (user?.uid) {
      const saved = localStorage.getItem(`mindmap_${user.uid}`);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setMindMapData(data);
        } catch (error) {
          console.error('Error loading mind map:', error);
        }
      }
    }
  }, [user?.uid]);

  // Save mind map to localStorage
  const saveMindMap = useCallback((data: MindMapNode) => {
    if (user?.uid) {
      localStorage.setItem(`mindmap_${user.uid}`, JSON.stringify(data));
    }
  }, [user?.uid]);

  // Generate mind map from AI
  const generateMindMap = async () => {
    if (!topic.trim()) {
      toast.error(t('mindmap.enterTopic'));
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`,
        },
        body: JSON.stringify({
          mode: 'mindmap',
          topic: topic.trim(),
          language: language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mind map');
      }

      const data = await response.json();
      
      // Convert AI response to our format with positions and colors
      const processedData = processAIData(data);
      setMindMapData(processedData);
      saveMindMap(processedData);
      toast.success(t('mindmap.generatedSuccess'));
    } catch (error) {
      console.error('Error generating mind map:', error);
      toast.error(t('mindmap.generationError'));
    } finally {
      setIsGenerating(false);
    }
  };

  // Process AI response to add positions and colors
  const processAIData = (data: any, level = 0, x = 0, y = 0): MindMapNode => {
    const id = Math.random().toString(36).substr(2, 9);
    const color = nodeColors[level % nodeColors.length];
    
    const node: MindMapNode = {
      id,
      title: data.title || 'Untitled',
      children: [],
      position: { x, y },
      color
    };

    if (data.children && Array.isArray(data.children)) {
      const childSpacing = 200;
      const startX = x - (data.children.length - 1) * childSpacing / 2;
      
      data.children.forEach((child: any, index: number) => {
        const childX = startX + index * childSpacing;
        const childY = y + 150;
        node.children.push(processAIData(child, level + 1, childX, childY));
      });
    }

    return node;
  };

  // Handle node click
  const handleNodeClick = (node: MindMapNode, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  // Handle modal actions
  const handleModalAction = (action: 'add' | 'edit' | 'delete') => {
    setModalAction(action);
    if (action === 'edit') {
      setEditText(selectedNode?.title || '');
    } else if (action === 'add') {
      setEditText('');
      setParentNode(selectedNode);
    }
  };

  // Add child node
  const addChildNode = () => {
    if (!editText.trim() || !parentNode) return;

    const newNode: MindMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      title: editText.trim(),
      children: [],
      position: { x: 0, y: 0 },
      color: nodeColors[(parentNode.children.length) % nodeColors.length]
    };

    const updatedData = addNodeToTree(mindMapData!, parentNode.id, newNode);
    setMindMapData(updatedData);
    saveMindMap(updatedData);
    setIsModalOpen(false);
    toast.success(t('mindmap.nodeAdded'));
  };

  // Edit node
  const editNode = () => {
    if (!editText.trim() || !selectedNode) return;

    const updatedData = updateNodeInTree(mindMapData!, selectedNode.id, editText.trim());
    setMindMapData(updatedData);
    saveMindMap(updatedData);
    setIsModalOpen(false);
    toast.success(t('mindmap.nodeEdited'));
  };

  // Delete node
  const deleteNode = () => {
    if (!selectedNode) return;

    const updatedData = deleteNodeFromTree(mindMapData!, selectedNode.id);
    setMindMapData(updatedData);
    saveMindMap(updatedData);
    setIsModalOpen(false);
    toast.success(t('mindmap.nodeDeleted'));
  };

  // Tree manipulation functions
  const addNodeToTree = (tree: MindMapNode, parentId: string, newNode: MindMapNode): MindMapNode => {
    if (tree.id === parentId) {
      return { ...tree, children: [...tree.children, newNode] };
    }
    return {
      ...tree,
      children: tree.children.map(child => addNodeToTree(child, parentId, newNode))
    };
  };

  const updateNodeInTree = (tree: MindMapNode, nodeId: string, newTitle: string): MindMapNode => {
    if (tree.id === nodeId) {
      return { ...tree, title: newTitle };
    }
    return {
      ...tree,
      children: tree.children.map(child => updateNodeInTree(child, nodeId, newTitle))
    };
  };

  const deleteNodeFromTree = (tree: MindMapNode, nodeId: string): MindMapNode => {
    return {
      ...tree,
      children: tree.children
        .filter(child => child.id !== nodeId)
        .map(child => deleteNodeFromTree(child, nodeId))
    };
  };

  // Zoom controls
  const zoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.3));
  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle pan
  const handlePan = (event: any, info: PanInfo) => {
    if (!isDragging.current) {
      setPosition(prev => ({
        x: prev.x + info.delta.x,
        y: prev.y + info.delta.y
      }));
    }
  };

  // Render node
  const renderNode = (node: MindMapNode, isRoot = false) => (
    <motion.div
      key={node.id}
      className={`absolute cursor-pointer select-none ${
        isRoot ? 'z-20' : 'z-10'
      }`}
      style={{
        left: node.position?.x || 0,
        top: node.position?.y || 0,
        transform: 'translate(-50%, -50%)'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => handleNodeClick(node, e)}
      drag
      dragMomentum={false}
      onDragStart={() => { isDragging.current = true; }}
      onDragEnd={() => { isDragging.current = false; }}
    >
      <div
        className={`px-4 py-3 rounded-xl border-4 border-black font-bold text-sm max-w-48 text-center shadow-lg ${
          isRoot ? 'text-lg min-w-48' : 'text-sm min-w-32'
        }`}
        style={{
          backgroundColor: node.color || '#e8f5e8',
          boxShadow: '4px 4px 0px #000'
        }}
      >
        {node.title}
      </div>
      
      {/* Render connections to children */}
      {node.children.map((child, index) => (
        <svg
          key={`${node.id}-${child.id}`}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ zIndex: -1 }}
        >
          <path
            d={`M ${node.position?.x || 0} ${node.position?.y || 0} Q ${
              ((node.position?.x || 0) + (child.position?.x || 0)) / 2
            } ${(node.position?.y || 0) + 50} ${child.position?.x || 0} ${child.position?.y || 0}`}
            stroke="#000"
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
          />
        </svg>
      ))}
      
      {/* Render children */}
      {node.children.map(child => renderNode(child, false))}
    </motion.div>
  );

  return (
    <div className={`w-full h-full relative overflow-hidden ${className}`}>
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('mindmap.enterTopicPlaceholder')}
            className="max-w-md border-4 border-black font-bold"
            style={{ boxShadow: '3px 3px 0px #000' }}
            onKeyPress={(e) => e.key === 'Enter' && generateMindMap()}
          />
          <Button
            onClick={generateMindMap}
            disabled={isGenerating}
            className="px-6 py-2 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 flex items-center gap-2"
            style={{
              backgroundColor: '#00e6c4',
              color: '#000',
              boxShadow: '4px 4px 0px #000'
            }}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isGenerating ? t('mindmap.generating') : t('mindmap.generate')}
          </Button>
        </div>
      </div>

      {/* Mind Map Container */}
      <motion.div
        ref={containerRef}
        className="w-full h-full relative"
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: 'center center'
        }}
        onDrag={(event, info) => handlePan(event, info)}
        drag
        dragMomentum={false}
      >
        {mindMapData ? (
          <div className="w-full h-full flex items-center justify-center">
            {renderNode(mindMapData, true)}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-2xl font-black mb-4">{t('mindmap.welcome')}</h3>
              <p className="text-lg opacity-70">{t('mindmap.enterTopicToStart')}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Floating Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
        <Button
          onClick={resetView}
          className="w-12 h-12 border-4 border-black font-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400"
          style={{
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '3px 3px 0px #000'
          }}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button
          onClick={zoomIn}
          className="w-12 h-12 border-4 border-black font-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400"
          style={{
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '3px 3px 0px #000'
          }}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
        <Button
          onClick={zoomOut}
          className="w-12 h-12 border-4 border-black font-black transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400"
          style={{
            backgroundColor: '#fff',
            color: '#000',
            boxShadow: '3px 3px 0px #000'
          }}
        >
          <ZoomOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Node Interaction Modal */}
      {isModalOpen && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white dark:bg-zinc-800 rounded-t-2xl p-6 w-full max-w-md"
            style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.3)' }}
          >
            {/* Drag Handle */}
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
            
            {/* Node Info */}
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: selectedNode.color || '#e8f5e8' }}
              >
                {selectedNode.title.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedNode.title}</h3>
                <p className="text-sm text-gray-500">{t('mindmap.clickToInteract')}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleModalAction('add')}
                className="w-full p-4 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 flex items-center gap-3"
                style={{
                  backgroundColor: '#00e6c4',
                  color: '#000',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                <Plus className="w-5 h-5" />
                {t('mindmap.addChildNode')}
              </Button>
              
              <Button
                onClick={() => handleModalAction('edit')}
                className="w-full p-4 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400 flex items-center gap-3"
                style={{
                  backgroundColor: '#fff',
                  color: '#000',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                <Edit className="w-5 h-5" />
                {t('mindmap.editNode')}
              </Button>
              
              <Button
                onClick={() => handleModalAction('delete')}
                className="w-full p-4 border-4 border-red-500 font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-red-400 flex items-center gap-3"
                style={{
                  backgroundColor: '#fff',
                  color: '#dc2626',
                  boxShadow: '4px 4px 0px #dc2626'
                }}
              >
                <Trash2 className="w-5 h-5" />
                {t('mindmap.deleteNode')}
              </Button>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 p-0 border-2 border-gray-300 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      )}

      {/* Action Modal */}
      {isModalOpen && modalAction !== 'delete' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md border-4 border-black"
            style={{ boxShadow: '8px 8px 0px #000' }}
          >
            <h3 className="text-xl font-black mb-4">
              {modalAction === 'add' ? t('mindmap.addChildNode') : t('mindmap.editNode')}
            </h3>
            
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder={modalAction === 'add' ? t('mindmap.enterChildTitle') : t('mindmap.enterNewTitle')}
              className="w-full p-3 border-4 border-black font-bold mb-4"
              style={{ boxShadow: '3px 3px 0px #000' }}
              rows={3}
            />
            
            <div className="flex gap-3">
              <Button
                onClick={() => modalAction === 'add' ? addChildNode() : editNode()}
                disabled={!editText.trim()}
                className="flex-1 px-6 py-3 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400"
                style={{
                  backgroundColor: '#00e6c4',
                  color: '#000',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                <Save className="w-5 h-5 mr-2" />
                {t('common.save')}
              </Button>
              
              <Button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400"
                style={{
                  backgroundColor: '#fff',
                  color: '#000',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                <X className="w-5 h-5 mr-2" />
                {t('common.cancel')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isModalOpen && modalAction === 'delete' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-800 rounded-xl p-6 w-full max-w-md border-4 border-red-500"
            style={{ boxShadow: '8px 8px 0px #dc2626' }}
          >
            <h3 className="text-xl font-black mb-4 text-red-600">
              {t('mindmap.confirmDelete')}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {t('mindmap.deleteWarning')}
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={deleteNode}
                className="flex-1 px-6 py-3 border-4 border-red-500 font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-red-400"
                style={{
                  backgroundColor: '#fff',
                  color: '#dc2626',
                  boxShadow: '4px 4px 0px #dc2626'
                }}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {t('common.delete')}
              </Button>
              
              <Button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 border-4 border-black font-black text-lg tracking-wide transition-all duration-150 hover:translate-y-[-2px] active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-blue-400"
                style={{
                  backgroundColor: '#fff',
                  color: '#000',
                  boxShadow: '4px 4px 0px #000'
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MindMap;
