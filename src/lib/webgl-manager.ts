
import * as THREE from 'three';

class WebGLManager {
  private renderers: THREE.WebGLRenderer[] = [];
  private contexts: WebGLRenderingContext[] = [];

  addRenderer(renderer: THREE.WebGLRenderer) {
    this.renderers.push(renderer);
    const context = renderer.getContext() as WebGLRenderingContext;
    this.contexts.push(context);
  }

  disposeRenderer(renderer: THREE.WebGLRenderer) {
    try {
      // Dispose of all geometries, materials, textures
      renderer.dispose();
      
      // Force context loss if available
      const context = renderer.getContext();
      const loseContext = context.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }

      // Remove from tracking arrays
      this.renderers = this.renderers.filter(r => r !== renderer);
    } catch (error) {
      console.warn('WebGL cleanup failed:', error);
    }
  }

  disposeAll() {
    this.renderers.forEach(renderer => {
      this.disposeRenderer(renderer);
    });
    this.renderers = [];
    this.contexts = [];
  }

  // Hook for React components
  createManagedRenderer(canvas?: HTMLCanvasElement): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ 
      canvas,
      antialias: true,
      alpha: true 
    });
    
    this.addRenderer(renderer);
    return renderer;
  }
}

export const webglManager = new WebGLManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    webglManager.disposeAll();
  });
}
