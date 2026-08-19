import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, Bounds, Html, BakeShadows } from '@react-three/drei';
import { Loader2, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error('3D Model failed to load:', error);
    if (this.props.onError) this.props.onError();
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  
  // Cleanup WebGL resources on unmount
  useEffect(() => {
    return () => {
      useGLTF.clear(url);
      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry.dispose();
          if (object.material.isMaterial) {
             object.material.dispose();
          } else if (Array.isArray(object.material)) {
             object.material.forEach(m => m.dispose());
          }
        }
      });
    };
  }, [scene, url]);

  return <primitive object={scene} />;
};

const Product3DViewer = ({ modelUrl, fallbackImage, className }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  if (!modelUrl || error) {
    return (
      <div className={cn("relative w-full h-[500px] md:h-[600px] bg-bg-primary flex items-center justify-center overflow-hidden rounded-xl", className)}>
        {fallbackImage ? (
          <img src={fallbackImage} alt="Product fallback" className="object-cover w-full h-full" />
        ) : (
          <div className="text-text-secondary flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>3D model unavailable</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-bg-primary group transition-all duration-500",
        isFullscreen ? "fixed inset-0 z-[100] w-screen h-screen m-0 rounded-none" : "w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden",
        className
      )}
      role="region"
      aria-label="Interactive 3D model"
    >
      <ErrorBoundary 
        onError={() => setError(true)}
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-bg-primary z-10">
            <div className="text-center text-text-secondary">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Failed to load 3D model.</p>
              <button 
                type="button"
                onClick={() => setError(false)}
                className="mt-4 text-[10px] uppercase font-bold tracking-widest hover:text-color-gold transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        }
      >
        <Canvas 
          shadows 
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ 
            preserveDrawingBuffer: false, // Performance: don't preserve unless needed
            antialias: true, 
            powerPreference: 'high-performance',
            alpha: false // Opaque background is faster
          }}
          dpr={[1, 1.5]} // Performance: limit pixel ratio on high DPI displays
        >
          <color attach="background" args={['#050505']} />
          <Suspense fallback={
            <Html center>
              <div className="flex flex-col items-center justify-center p-6 bg-surface-primary/80 backdrop-blur-md rounded-2xl border border-surface-border shadow-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-color-gold mb-3" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Loading 3D</span>
              </div>
            </Html>
          }>
            <Stage environment="city" intensity={0.5} contactShadow={{ opacity: 0.2, blur: 2, resolution: 256 }}>
              <BakeShadows />
              <Bounds fit clip observe margin={1.2}>
                <Model url={modelUrl} />
              </Bounds>
            </Stage>
          </Suspense>
          <OrbitControls 
            makeDefault 
            autoRotate 
            autoRotateSpeed={0.5}
            enablePan={false}
            minDistance={1}
            maxDistance={10}
            enableZoom={true}
          />
        </Canvas>
      </ErrorBoundary>

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute bottom-6 right-6 p-4 bg-surface-primary/80 backdrop-blur-md border border-surface-border text-text-primary hover:text-color-gold rounded-full shadow-2xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10 hover:scale-110"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>
    </div>
  );
};

export default Product3DViewer;
