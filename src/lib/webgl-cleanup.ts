
export const cleanupWebGLContexts = () => {
  try {
    // Get all canvas elements
    const canvases = document.querySelectorAll('canvas');
    
    canvases.forEach((canvas) => {
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      const gl2 = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
      const webglContext = gl || gl2;
      
      if (webglContext && typeof webglContext.getExtension === 'function') {
        const loseContext = webglContext.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    });
  } catch (error) {
    console.warn('WebGL cleanup failed:', error);
  }
};
