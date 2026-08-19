import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, MeshDistortMaterial, ContactShadows, PresentationControls, Sparkles, BakeShadows } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';


const AbstractGoldPiece = () => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  // Cleanup geometry and material on unmount
  useEffect(() => {
    return () => {
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        meshRef.current.material.dispose();
      }
    };
  }, []);

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.5}>
        <torusKnotGeometry args={[1, 0.3, 256, 64]} />
        <MeshDistortMaterial
          color="#C9A227"
          envMapIntensity={2.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          metalness={1}
          roughness={0.1}
          distort={0.2}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
};

const CinematicMarketHero = () => {
  return (
    <section className="relative w-full h-screen min-h-[800px] bg-bg-primary overflow-hidden flex items-center">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 45 }} 
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
        >
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          
          <Suspense fallback={null}>
            <PresentationControls
              global
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
              rotation={[0, 0.3, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
              <AbstractGoldPiece />
            </PresentationControls>
            <Environment preset="city" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} resolution={256} />
            <Sparkles count={40} scale={10} size={2} speed={0.4} opacity={0.2} color="#E6D3A3" />
            <BakeShadows />
          </Suspense>
        </Canvas>
      </div>

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-bg-primary via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 luxury-shell w-full pointer-events-none">
        <div className="max-w-2xl pointer-events-auto">
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-surface-border rounded-full bg-surface-primary/50 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-color-gold animate-pulse" />
            <span className="font-sans font-medium uppercase tracking-[0.2em] text-[10px] text-text-primary">
              The Digital Showroom
            </span>
          </div>
          
          <h1 className="text-display text-5xl md:text-7xl lg:text-8xl text-text-primary leading-[1.05] tracking-tight mb-8 drop-shadow-2xl">
            Define Your <br />
            <span className="text-color-gold italic pr-4 drop-shadow-2xl">Legacy.</span>
          </h1>
          
          <p className="text-text-secondary text-base md:text-lg max-w-lg leading-relaxed mb-10 font-sans drop-shadow-md">
            A highly curated selection of extraordinary jewelry, timepieces, and investment-grade gold. Verified, authenticated, and delivered with uncompromising precision.
          </p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <Link 
              to="/collections"
              className="luxury-button inline-flex items-center gap-3 group"
            >
              Explore Collections
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              to="/about"
              className="luxury-button-outline"
            >
              The Experience
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CinematicMarketHero;
