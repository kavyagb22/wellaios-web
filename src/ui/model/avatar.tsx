import {useFrame} from '@react-three/fiber';
import {useEffect, useRef, useState} from 'react';
import {Group, Object3DEventMap, AnimationClip, AnimationMixer} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MToonMaterial, VRM, VRMLoaderPlugin, VRMUtils} from '@pixiv/three-vrm';
import {loadMixamoAnimation} from './loadMixama';
import * as THREE from 'three';

const Avatar3D: React.FC<{
    talking: boolean;
}> = function ({talking}) {
    const [scene, setScene] = useState<Group<Object3DEventMap> | undefined>(
        undefined
    );
    const [idleAnimation, setIdleAnimation] = useState<
        AnimationClip | undefined
    >(undefined);
    const [talkAnimation, setTalkAnimation] = useState<
        AnimationClip | undefined
    >(undefined);

    const mixerRef = useRef<AnimationMixer | undefined>(undefined);

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register(parser => new VRMLoaderPlugin(parser));

        loader.load('models/model.vrm', gltf => {
            const vrm: VRM = gltf.userData.vrm;

            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.combineSkeletons(gltf.scene);
            VRMUtils.combineMorphs(vrm);

            vrm.scene.traverse(obj => {
                obj.frustumCulled = false;
            });

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

            vrm.scene.traverse(object => {
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
            loadMixamoAnimation('animations/idle.fbx', vrm, setIdleAnimation);
            loadMixamoAnimation('animations/talk.fbx', vrm, setTalkAnimation);
        });
    }, []);

    useEffect(() => {
        if (scene !== undefined) {
            if (talking && talkAnimation !== undefined) {
                const newMixer = new AnimationMixer(scene);
                mixerRef.current = newMixer;
                mixerRef.current.clipAction(talkAnimation).play();
            } else if (!talking && idleAnimation !== undefined) {
                const newMixer = new AnimationMixer(scene);
                mixerRef.current = newMixer;
                mixerRef.current.clipAction(idleAnimation).play();
            }
        }
    }, [scene, idleAnimation, talkAnimation, talking]);

    useFrame((state, delta) => {
        if (mixerRef.current !== undefined) {
            mixerRef.current.update(delta);
        }
    });

    return (
        scene && (
            // idleAnimation && (
            <group>
                <primitive object={scene} />
            </group>
        )
    );
};

export default Avatar3D;
