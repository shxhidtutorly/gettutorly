
declare namespace THREE {
  interface WebGLRenderer {
    domElement: HTMLCanvasElement;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
    dispose(): void;
  }

  interface Scene {
    add(object: Object3D): void;
    remove(object: Object3D): void;
  }

  interface Camera {}
  interface Object3D {}
  interface Mesh extends Object3D {}
  interface Material {
    dispose(): void;
  }
  interface Geometry {
    dispose(): void;
  }
}
