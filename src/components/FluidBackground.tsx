import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const FluidShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uColor1: { value: new THREE.Color('#3898EC') },
    uColor2: { value: new THREE.Color('#7BFFC4') },
    uColor3: { value: new THREE.Color('#1a1a2e') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    varying vec2 vUv;
    
    #define PI 3.14159265359
    
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    float smoothNoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for(int i = 0; i < 6; i++) {
        value += amplitude * smoothNoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return value;
    }
    
    void main() {
      vec2 uv = vUv;
      vec2 mouse = uMouse;
      
      // Create flowing motion
      float time = uTime * 0.15;
      
      // Multiple layers of noise for fluid effect
      vec2 q = vec2(0.0);
      q.x = fbm(uv + time * 0.3);
      q.y = fbm(uv + vec2(1.0));
      
      vec2 r = vec2(0.0);
      r.x = fbm(uv + q + vec2(1.7, 9.2) + time * 0.2);
      r.y = fbm(uv + q + vec2(8.3, 2.8) + time * 0.3);
      
      float f = fbm(uv + r);
      
      // Mouse interaction - create ripple
      float dist = distance(uv, mouse);
      float ripple = sin(dist * 20.0 - uTime * 3.0) * exp(-dist * 3.0) * 0.1;
      f += ripple;
      
      // Color mixing
      vec3 color = uColor3;
      color = mix(color, uColor1, clamp(f * 2.0, 0.0, 1.0));
      color = mix(color, uColor2, clamp(length(q) * 0.5, 0.0, 0.3));
      
      // Add subtle glow near mouse
      float glow = exp(-dist * 2.0) * 0.15;
      color += uColor1 * glow;
      
      // Vignette
      float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5));
      color *= vignette * 0.7 + 0.3;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

function FluidPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const { viewport } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    }
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: 1 - e.clientY / window.innerHeight,
      };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={FluidShader.uniforms}
        vertexShader={FluidShader.vertexShader}
        fragmentShader={FluidShader.fragmentShader}
      />
    </mesh>
  );
}

export default function FluidBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <FluidPlane />
      </Canvas>
    </div>
  );
}
