import {useFrame} from '@react-three/fiber';
import {useEffect, useRef, useState} from 'react';
import {Group, Object3DEventMap, AnimationClip, AnimationMixer} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {VRM, VRMLoaderPlugin, VRMUtils} from '@pixiv/three-vrm';
import {loadMixamoAnimation} from './loadMixama';

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
        scene &&
        mixerRef.current !== null && (
            <group>
                <primitive object={scene} />
            </group>
        )
    );
};

export default Avatar3D;
