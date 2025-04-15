import {VRM} from '@pixiv/three-vrm';
import * as THREE from 'three';
import {FBXLoader} from 'three/examples/jsm/Addons.js';

const loaded = function (
    asset: THREE.Group<THREE.Object3DEventMap>,
    vrm: VRM,
    setAnimation: (x: THREE.AnimationClip) => void
) {
    const clip = asset.animations[0];
    // THREE.AnimationClip.findByName(asset.animations, 'mixamo.com'); // extract the AnimationClip

    const tracks: THREE.KeyframeTrack[] = []; // KeyframeTracks compatible with VRM will be added here

    const restRotationInverse = new THREE.Quaternion();
    const parentRestWorldRotation = new THREE.Quaternion();
    const _quatA = new THREE.Quaternion();
    const _vec3 = new THREE.Vector3();

    // Adjust with reference to hips height.
    const motionHipsHeight = asset.getObjectByName('mixamorigHips')?.position.y;
    const vrmHipsY = vrm.humanoid
        ?.getNormalizedBoneNode('hips')
        ?.getWorldPosition(_vec3).y;

    let hipsPositionScale = 1;
    if (motionHipsHeight !== undefined && vrmHipsY !== undefined) {
        const vrmRootY = vrm.scene.getWorldPosition(_vec3).y;
        const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY);
        hipsPositionScale = vrmHipsHeight / motionHipsHeight;
    }

    clip.tracks.forEach(track => {
        // Convert each tracks for VRM use, and push to `tracks`
        const trackSplitted = track.name.split('.');
        const mixamoRigName = trackSplitted[0];
        const vrmBoneName = mapBoneName(mixamoRigName);
        const mixamoRigNode = asset.getObjectByName(mixamoRigName);

        if (vrmBoneName !== null && mixamoRigNode !== undefined) {
            const propertyName = trackSplitted[1];

            // Store rotations of rest-pose.
            mixamoRigNode.getWorldQuaternion(restRotationInverse).invert();
            mixamoRigNode.parent?.getWorldQuaternion(parentRestWorldRotation);

            if (track instanceof THREE.QuaternionKeyframeTrack) {
                // Retarget rotation of mixamoRig to NormalizedBone.
                for (let i = 0; i < track.values.length; i += 4) {
                    const flatQuaternion = track.values.slice(i, i + 4);

                    _quatA.fromArray(flatQuaternion);

                    _quatA
                        .premultiply(parentRestWorldRotation)
                        .multiply(restRotationInverse);

                    _quatA.toArray(flatQuaternion);

                    flatQuaternion.forEach((v, index) => {
                        track.values[index + i] = v;
                    });
                }

                tracks.push(
                    new THREE.QuaternionKeyframeTrack(
                        `${vrmBoneName}.${propertyName}`,
                        [...track.times],
                        [
                            ...track.values.map((v, i) =>
                                vrm.meta?.metaVersion === '0' && i % 2 === 0
                                    ? -v
                                    : v
                            ),
                        ]
                    )
                );
            } else if (track instanceof THREE.VectorKeyframeTrack) {
                const value = track.values.map(
                    (v, i) =>
                        (vrm.meta?.metaVersion === '0' && i % 3 !== 1
                            ? -v
                            : v) * hipsPositionScale
                );
                tracks.push(
                    new THREE.VectorKeyframeTrack(
                        `${vrmBoneName}.${propertyName}`,
                        [...track.times],
                        [...value]
                    )
                );
            }
        }
    });

    setAnimation(
        new THREE.AnimationClip('vrmAnimation', clip.duration, tracks)
    );
};

export function loadMixamoAnimation(
    url: string,
    vrm: VRM,
    setAnimation: (x: THREE.AnimationClip) => void
) {
    const loader = new FBXLoader(); // A loader which loads FBX
    return loader.load(url, asset => loaded(asset, vrm, setAnimation));
}

const mapBoneName = (originalBoneName: string): string | null => {
    const mapped = boneMapping[originalBoneName];
    return mapped || null; // Return mapped name or null if not found
};

const boneMapping: {[key: string]: string} = {
    // Add your mappings here
    mixamorigHips: 'J_Bip_C_Hips',
    mixamorigHead: 'J_Bip_C_Head',
    mixamorigSpine: 'J_Bip_C_Spine',
    mixamorigSpine1: 'J_Bip_C_Chest',
    mixamorigSpine2: 'J_Bip_C_UpperChest',
    mixamorigNeck: 'J_Bip_C_Neck',
    mixamorigRightShoulder: 'J_Bip_R_Shoulder',
    mixamorigRightArm: 'J_Bip_R_UpperArm',
    mixamorigRightForeArm: 'J_Bip_R_LowerArm',
    mixamorigRightHand: 'J_Bip_R_Hand',
    mixamorigRightHandThumb1: 'J_Bip_R_Thumb1',
    mixamorigRightHandThumb2: 'J_Bip_R_Thumb2',
    mixamorigRightHandThumb3: 'J_Bip_R_Thumb3',
    mixamorigRightHandIndex1: 'J_Bip_R_Index1',
    mixamorigRightHandIndex2: 'J_Bip_R_Index2',
    mixamorigRightHandIndex3: 'J_Bip_R_Index3',
    mixamorigRightHandMiddle1: 'J_Bip_R_Middle1',
    mixamorigRightHandMiddle2: 'J_Bip_R_Middle2',
    mixamorigRightHandMiddle3: 'J_Bip_R_Middle3',
    mixamorigRightHandRing1: 'J_Bip_R_Ring1',
    mixamorigRightHandRing2: 'J_Bip_R_Ring2',
    mixamorigRightHandRing3: 'J_Bip_R_Ring3',
    mixamorigRightHandPinky1: 'J_Bip_R_Little1',
    mixamorigRightHandPinky2: 'J_Bip_R_Little2',
    mixamorigRightHandPinky3: 'J_Bip_R_Little3',
    mixamorigLeftShoulder: 'J_Bip_L_Shoulder',
    mixamorigLeftArm: 'J_Bip_L_UpperArm',
    mixamorigLeftForeArm: 'J_Bip_L_LowerArm',
    mixamorigLeftHand: 'J_Bip_L_Hand',
    mixamorigLeftHandThumb1: 'J_Bip_L_Thumb1',
    mixamorigLeftHandThumb2: 'J_Bip_L_Thumb2',
    mixamorigLeftHandThumb3: 'J_Bip_L_Thumb3',
    mixamorigLeftHandIndex1: 'J_Bip_L_Index1',
    mixamorigLeftHandIndex2: 'J_Bip_L_Index2',
    mixamorigLeftHandIndex3: 'J_Bip_L_Index3',
    mixamorigLeftHandMiddle1: 'J_Bip_L_Middle1',
    mixamorigLeftHandMiddle2: 'J_Bip_L_Middle2',
    mixamorigLeftHandMiddle3: 'J_Bip_L_Middle3',
    mixamorigLeftHandRing1: 'J_Bip_L_Ring1',
    mixamorigLeftHandRing2: 'J_Bip_L_Ring2',
    mixamorigLeftHandRing3: 'J_Bip_L_Ring3',
    mixamorigLeftHandPinky1: 'J_Bip_L_Little1',
    mixamorigLeftHandPinky2: 'J_Bip_L_Little2',
    mixamorigLeftHandPinky3: 'J_Bip_L_Little3',
    mixamorigRightUpLeg: 'J_Bip_R_UpperLeg',
    mixamorigRightLeg: 'J_Bip_R_LowerLeg',
    mixamorigRightFoot: 'J_Bip_R_Foot',
    mixamorigRightToeBase: 'J_Bip_R_ToeBase',
    mixamorigLeftUpLeg: 'J_Bip_L_UpperLeg',
    mixamorigLeftLeg: 'J_Bip_L_LowerLeg',
    mixamorigLeftFoot: 'J_Bip_L_Foot',
    mixamorigLeftToeBase: 'J_Bip_L_ToeBase',
};
