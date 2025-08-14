
// WebGL cleanup utility - only run when explicitly needed
export const cleanupWebGLContexts = () => {
  try {
    // Get all canvas elements
    const canvases = document.querySelectorAll('canvas');
    
    if (canvases.length === 0) return;
    
    canvases.forEach((canvas) => {
      try {
        const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
        const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
        const webglContext = gl || gl2;
        
        if (webglContext && typeof webglContext.getExtension === 'function') {
          const loseContext = webglContext.getExtension('WEBGL_lose_context');
          if (loseContext) {
            loseContext.loseContext();
          }
        }
      } catch (canvasError) {
        // Silently handle individual canvas errors
        console.debug('Canvas cleanup skipped:', canvasError);
      }
    });
  } catch (error) {
    console.warn('WebGL cleanup failed:', error);
  }
};

// Only run cleanup on page unload, not on route changes
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupWebGLContexts();
  });
}
