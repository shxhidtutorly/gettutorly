
export const cleanupWebGLContexts = () => {
  try {
    // Get all canvas elements
    const canvases = document.querySelectorAll('canvas');
    
    canvases.forEach((canvas) => {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl');
      if (gl && typeof gl.getExtension === 'function') {
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    });
  } catch (error) {
    console.warn('WebGL cleanup failed:', error);
  }
};
