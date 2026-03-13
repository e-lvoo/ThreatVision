import * as THREE from 'three';
import { ThreeElement } from '@react-three/fiber';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            points: ThreeElement<THREE.Points>;
            bufferGeometry: ThreeElement<THREE.BufferGeometry>;
            bufferAttribute: ThreeElement<THREE.BufferAttribute>;
            shaderMaterial: ThreeElement<THREE.ShaderMaterial>;
            mesh: ThreeElement<THREE.Mesh>;
            sphereGeometry: ThreeElement<THREE.SphereGeometry>;
            gridHelper: ThreeElement<THREE.GridHelper>;
            ambientLight: ThreeElement<THREE.AmbientLight>;
            pointLight: ThreeElement<THREE.PointLight>;
            color: ThreeElement<THREE.Color>;
        }
    }
}
