import {useFrame} from '@react-three/fiber';
import {useEffect, useRef, useState} from 'react';
import {Group, Object3DEventMap, AnimationClip, AnimationMixer} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MToonMaterial, VRM, VRMLoaderPlugin, VRMUtils} from '@pixiv/three-vrm';
import {loadMixamoAnimation} from './loadMixama';
import * as THREE from 'three';
import {Canvas} from '@react-three/fiber';
import {PerspectiveCamera} from '@react-three/drei';
import {Spinner} from '@blueprintjs/core';
import {getMedia} from '@/control/utils/media';

const toFindNames = new Set([
    'N00_000_Hair_00_HAIR_07 (Instance)',
    'N00_002_03_Tops_01_CLOTH_01 (Instance)',
    'N00_002_03_Tops_01_CLOTH_01 (Instance) (Outline)',
    'N00_002_03_Tops_01_CLOTH_02 (Instance)',
    'N00_002_03_Tops_01_CLOTH_02 (Instance) (Outline)',
    'N00_002_03_Tops_01_CLOTH_03 (Instance)',
    'N00_002_03_Tops_01_CLOTH_03 (Instance) (Outline)',
    'N00_007_01_Tops_01_CLOTH (Instance)',
    'N00_007_01_Tops_01_CLOTH (Instance) (Outline)',
    'N00_008_01_Shoes_01_CLOTH (Instance)',
    'N00_008_01_Shoes_01_CLOTH (Instance) (Outline)',
    'N00_010_01_Onepiece_00_CLOTH_01 (Instance)',
    'N00_010_01_Onepiece_00_CLOTH_01 (Instance) (Outline)',
    'N00_010_01_Onepiece_00_CLOTH_02 (Instance)',
    'N00_010_01_Onepiece_00_CLOTH_02 (Instance) (Outline)',
    'N00_010_01_Onepiece_00_CLOTH_03 (Instance)',
    'N00_010_01_Onepiece_00_CLOTH_03 (Instance) (Outline)',
]);

const Avatar3D: React.FC = function () {
    const [scene, setScene] = useState<Group<Object3DEventMap> | undefined>(
        undefined
    );
    const [animation, setAnimation] = useState<AnimationClip | undefined>(
        undefined
    );

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register(parser => new VRMLoaderPlugin(parser));

        loader.load(getMedia('app/models/sample.vrm'), gltf => {
            const vrm: VRM = gltf.userData.vrm;

            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.combineSkeletons(gltf.scene);
            VRMUtils.combineMorphs(vrm);

            vrm.scene.traverse(object => {
                object.frustumCulled = false;
                if (object instanceof THREE.Mesh) {
                    const mesh = object as THREE.Mesh;
                    const materials = Array.isArray(mesh.material)
                        ? mesh.material
                        : [mesh.material];
                    materials.forEach(material => {
                        if (material instanceof MToonMaterial) {
                            if (material.map) {
                                if (toFindNames.has(material.name)) {
                                    material.transparent = true;
                                    material.blending = THREE.NormalBlending;
                                    material.alphaToCoverage = true;
                                }
                            }
                        }
                    });
                }
            });

            VRMUtils.rotateVRM0(vrm);

            setScene(vrm.scene);

            vrm.humanoid.resetNormalizedPose();
            loadMixamoAnimation(
                getMedia('app/animation/sample-idle.fbx'),
                vrm,
                setAnimation
            );
        });
    }, []);

    return scene && animation ? (
        <Canvas
            style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
            }}
        >
            <ambientLight intensity={2} color="#ddbbbb" />
            <pointLight position={[0.5, 2, 1.3]} intensity={5} color="white" />
            <Avatar scene={scene} animation={animation} />
            <PerspectiveCamera makeDefault position={[0, 0.8, 1]} fov={75} />
        </Canvas>
    ) : (
        <Spinner size={100} />
    );
};

const Avatar: React.FC<{
    scene: Group<Object3DEventMap>;
    animation: AnimationClip;
}> = function ({scene, animation}) {
    const mixerRef = useRef<AnimationMixer | undefined>(undefined);

    useEffect(() => {
        const newMixer = new AnimationMixer(scene);
        mixerRef.current = newMixer;
        mixerRef.current.clipAction(animation).play();
    }, [scene, animation]);

    useFrame((state, delta) => {
        if (mixerRef.current !== undefined) {
            mixerRef.current.update(delta);
        }
    });

    return (
        <group>
            <primitive object={scene} />
        </group>
    );
};

export default Avatar3D;
