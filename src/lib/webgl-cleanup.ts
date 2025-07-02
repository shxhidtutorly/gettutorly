
/**
 * Utility functions for cleaning up WebGL contexts to prevent memory leaks
 * and "Context Lost" errors during navigation
 */

export const cleanupWebGLContexts = () => {
  const canvasElements = document.querySelectorAll('canvas');
  
  canvasElements.forEach(canvas => {
    // Try to get WebGL context
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
               canvas.getContext('webgl2') as WebGL2RenderingContext | null || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    if (gl) {
      // Lose the context gracefully
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
      
      // Clear any remaining resources
      try {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.flush();
        gl.finish();
      } catch (error) {
        // Ignore errors during cleanup
        console.debug('WebGL cleanup warning:', error);
      }
    }
  });
};

export const setupWebGLCleanupOnNavigation = () => {
  // Clean up WebGL contexts before page unload
  const handleBeforeUnload = () => {
    cleanupWebGLContexts();
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

// Hook for React components that use WebGL
export const useWebGLCleanup = () => {
  return {
    cleanupWebGL: cleanupWebGLContexts,
    setupCleanup: setupWebGLCleanupOnNavigation
  };
};
