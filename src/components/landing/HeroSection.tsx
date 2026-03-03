import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Text, Float, MeshDistortMaterial, Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Shield, Lock, Activity, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

// --- SHADERS ---

const PacketShader = {
    vertexShader: `
    varying vec2 vUv;
    varying float vProgress;
    attribute float aProgress;
    attribute float aSpeed;
    attribute float aOffset;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vProgress = mod(aProgress + uTime * aSpeed * 0.1, 1.0);
      
      vec3 pos = position;
      // Movement from left to right (-10 to 10)
      pos.x = (vProgress * 20.0) - 10.0;
      pos.y += sin(uTime + aOffset) * 0.5;
      pos.z += cos(uTime * 0.5 + aOffset) * 0.5;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = 4.0 * (1.0 / -mvPosition.z);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    varying float vProgress;
    uniform vec3 uColor;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
      gl_FragColor = vec4(uColor, alpha * 0.8);
    }
  `
};

const ShieldShader = {
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uIntensity;
    
    void main() {
      // Hexagonal-like grid pattern
      float grid = abs(sin(vPosition.x * 10.0 + uTime)) * abs(sin(vPosition.y * 10.0 + uTime));
      float hex = smoothstep(0.4, 0.5, grid);
      
      vec3 color = vec3(0.0, 0.5, 1.0); // Cyan/Blue
      float edge = 1.0 - length(vUv - 0.5) * 2.0;
      
      gl_FragColor = vec4(color, hex * edge * uIntensity * 0.3);
    }
  `
};

// --- COMPONENTS ---

const Packets = ({ count = 200, phase, color = "#00ffff" }: { count?: number, phase: number, color?: string }) => {
    const points = useRef<THREE.Points>(null!);
    const { uTime } = useMemo(() => ({ uTime: { value: 0 } }), []);

    const [positions, progress, speeds, offsets] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const prog = new Float32Array(count);
        const spd = new Float32Array(count);
        const off = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 20;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
            prog[i] = Math.random();
            spd[i] = 0.5 + Math.random() * 2;
            off[i] = Math.random() * 100;
        }
        return [pos, prog, spd, off];
    }, [count]);

    useFrame((state) => {
        uTime.value = state.clock.getElapsedTime();
        if (points.current) {
            // Logic for scene transitions
            if (phase >= 3) {
                // Redirection logic could go here
            }
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aProgress" count={count} array={progress} itemSize={1} />
                <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
                <bufferAttribute attach="attributes-aOffset" count={count} array={offsets} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{ uTime, uColor: { value: new THREE.Color(color) } }}
                vertexShader={PacketShader.vertexShader}
                fragmentShader={PacketShader.fragmentShader}
            />
        </points>
    );
};

const HolographicShield = ({ visible, intensity }: { visible: boolean, intensity: number }) => {
    const mesh = useRef<THREE.Mesh>(null!);
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: 0 }
    }), []);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.getElapsedTime();
        uniforms.uIntensity.value = THREE.MathUtils.lerp(uniforms.uIntensity.value, visible ? intensity : 0, 0.05);
    });

    return (
        <mesh ref={mesh} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
            <sphereGeometry args={[4, 32, 32]} />
            <shaderMaterial
                transparent
                side={THREE.DoubleSide}
                uniforms={uniforms}
                vertexShader={ShieldShader.vertexShader}
                fragmentShader={ShieldShader.fragmentShader}
            />
        </mesh>
    );
};

const BackgroundGrid = () => {
    return (
        <gridHelper args={[100, 50, "#1e293b", "#0f172a"]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -10]} />
    );
};

const Scene = () => {
    const [phase, setPhase] = useState(1);
    const [packetCount, setPacketCount] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(2), 3000),  // Activation
            setTimeout(() => setPhase(3), 6000),  // Classification
            setTimeout(() => setPhase(4), 10000), // Loop
        ];

        const countInterval = setInterval(() => {
            setPacketCount(prev => prev + Math.floor(Math.random() * 5) + 1);
        }, 100);

        return () => {
            timers.forEach(t => clearTimeout(t));
            clearInterval(countInterval);
        };
    }, []);

    return (
        <>
            <color attach="background" args={["#050816"]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />

            <BackgroundGrid />
            <Packets phase={phase} count={150} color={phase >= 3 ? "#00ff00" : "#00ffff"} />
            {phase >= 3 && <Packets phase={phase} count={50} color="#ff0000" />}

            <HolographicShield visible={phase >= 2} intensity={phase === 2 ? 1 : 0.4} />

            <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>

            {/* Camera Intro */}
            <CameraController phase={phase} />

            {/* UI Elements via Html */}
            <Html position={[-8, 4, 0]} className="pointer-events-none w-[400px]">
                <div className="space-y-2">
                    {phase === 2 && (
                        <div className="flex items-center gap-2 bg-primary/20 border border-primary/50 backdrop-blur-md px-4 py-2 rounded-full text-primary animate-in fade-in slide-in-from-left-4 duration-1000">
                            <Activity className="h-4 w-4 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-wider">Pretrained AI Model Analyzing Traffic</span>
                        </div>
                    )}
                </div>
            </Html>

            <Html fullscreen className="pointer-events-none">
                <div className="absolute bottom-10 left-10 text-white/50 font-mono text-sm transition-opacity duration-1000">
                    Packets Inspected: <span className="text-primary font-bold">{packetCount.toLocaleString()}</span>
                </div>
            </Html>
        </>
    );
};

const CameraController = ({ phase }: { phase: number }) => {
    const { camera } = useThree();
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (phase === 1) {
            camera.position.lerp(new THREE.Vector3(5 * Math.sin(t * 0.1), 2, 12), 0.01);
        } else {
            camera.position.lerp(new THREE.Vector3(0, 0, 15), 0.02);
        }
        camera.lookAt(0, 0, 0);
    });
    return null;
};

// --- HERO SECTION ---

const HeroSection = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#050816]">
            {/* Three.js Canvas */}
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 2, 12], fov: 45 }}>
                    <Scene />
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="relative z-10 w-full h-full container mx-auto flex items-center justify-between pointer-events-none">
                {/* Left Side: Brand */}
                <div className="max-w-2xl pointer-events-auto animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 shadow-glow-primary">
                            <Shield className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-3xl font-bold tracking-tighter text-white">ThreatVision</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight leading-none">
                        Adaptive <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyber-pink">AI-Powered</span> <br />
                        Network Defense
                    </h1>

                    <p className="text-xl text-gray-400 mb-8 max-w-lg leading-relaxed">
                        Protect your digital infrastructure with real-time autonomous threat detection powered by advanced neural sequence classification.
                    </p>

                    <div className="flex gap-4">
                        <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-glow-primary group" asChild>
                            <Link to="/register">
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-white/10 text-white hover:bg-white/5 backdrop-blur-sm">
                            View Demo
                        </Button>
                    </div>
                </div>

                {/* Right Side: Glassmorphism Login Card */}
                <div className="hidden lg:block w-full max-w-sm pointer-events-auto animate-fade-in">
                    <div className="glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-colors" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <Lock className="h-5 w-5 text-primary" />
                                <h3 className="font-bold text-lg text-white">Secure Access</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2 text-left">
                                    <label className="text-xs font-bold text-white/50 uppercase tracing-widest">Workspace ID</label>
                                    <div className="h-12 w-full bg-white/5 border border-white/10 rounded-xl px-4 flex items-center text-white/80 font-mono text-sm">
                                        threatvision_core_v1
                                    </div>
                                </div>

                                <div className="py-4 border-t border-white/5">
                                    <p className="text-sm text-white/40 mb-6 italic">
                                        "AI Defense active. Monitoring 14.2k packets/sec with 99.8% precision."
                                    </p>

                                    <Button className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/5" asChild>
                                        <Link to="/login">Sign in to Dashboard</Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center gap-8 px-4 py-3 rounded-full bg-black/40 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-[10px] font-bold text-white/60 uppercase">System Optimal</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-bold text-white/60 uppercase">DistilBERT V2.4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
