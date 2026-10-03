import { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFBX, Environment } from '@react-three/drei';

function HatModel() {
  const fbx = useFBX('/Witch_hat.fbx');
  return (
    <primitive 
      object={fbx} 
      scale={0.05} 
      position={[0, -1, 0]} 
      rotation={[0.1, 0, 0]} 
    />
  );
}

export default function AnimatedHat() {
  const [landed, setLanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLanded(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="absolute z-20 pointer-events-none"
      style={{
        top: '-15%',
        left: '50%',
        marginLeft: '-100px',
        width: '200px',
        height: '200px',
        animation: landed 
          ? 'floatHat 4s ease-in-out infinite' 
          : 'dropAndBounce 1.2s cubic-bezier(0.28, 0.84, 0.42, 1) forwards'
      }}
    >
      <style>{`
        @keyframes dropAndBounce {
          0% { transform: translateY(-300px) rotate(-35deg) scale(0.8); opacity: 0; }
          50% { transform: translateY(25px) rotate(20deg) scale(1.1); opacity: 1; }
          75% { transform: translateY(-15px) rotate(8deg) scale(0.95); }
          100% { transform: translateY(0px) rotate(15deg) scale(1); opacity: 1; }
        }
        @keyframes floatHat {
          0% { transform: translateY(0px) rotate(15deg); }
          50% { transform: translateY(-6px) rotate(18deg); }
          100% { transform: translateY(0px) rotate(15deg); }
        }
      `}</style>
      
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Environment preset="city" />
        <Suspense fallback={null}>
          <HatModel />
        </Suspense>
      </Canvas>
    </div>
  );
}