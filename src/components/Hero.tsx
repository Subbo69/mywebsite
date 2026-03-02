import { ArrowRight, Send, Play, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

function AntigravityParticles() {
  const points = useRef<THREE.Points>(null!);
  const { mouse } = useThree();
  const count = 5000;

  const [positions, step] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const step = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      step[i] = Math.random();
    }
    return [pos, step];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const attribute = points.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      attribute.array[i3 + 1] += Math.sin(time + step[i]) * 0.002;
      attribute.array[i3] += (mouse.x * 5 - attribute.array[i3]) * 0.01;
      attribute.array[i3 + 1] += (mouse.y * 3 - attribute.array[i3 + 1]) * 0.01;
    }
    attribute.needsUpdate = true;
    points.current.rotation.y = time * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#6366f1" 
        transparent 
        opacity={0.4} 
        sizeAttenuation={true}
        blending={THREE.NormalBlending} // Fix: Changed from Additive to Normal for white backgrounds
      />
    </points>
  );
}

export default function Hero({ onBookingClick, onAskAIClick, language }: HeroProps) {
  const t = translations[language];
  const [displayText, setDisplayText] = useState("");
  const [showParticles, setShowParticles] = useState(true); // Set to true immediately for testing
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Simple Typewriter for Title
  useEffect(() => {
    let i = 0;
    const fullText = t.heroTitle;
    const interval = setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [t.heroTitle]);

  return (
    <section className="relative min-h-screen flex flex-col items-center bg-white overflow-hidden pt-32">
      {/* 3D CANVAS CONTAINER */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ height: '100vh', width: '100vw' }}>
        <Canvas 
          camera={{ position: [0, 0, 5] }}
          dpr={[1, 2]} // Performance scaling
          gl={{ antialias: true }}
        >
          <AntigravityParticles />
          <EffectComposer>
            <Bloom intensity={0.4} luminanceThreshold={0.8} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-bold mb-8">{displayText}</h1>
        <p className="text-xl text-zinc-500 italic mb-12">{t.heroSubtitle}</p>
        
        <button 
          onClick={onBookingClick}
          className="bg-black text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
        >
          {t.startJourney}
        </button>
      </div>
    </section>
  );
}