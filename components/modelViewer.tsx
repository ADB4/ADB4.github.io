import * as React from "react";
import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import {
    Environment,
    OrbitControls,
    useGLTF,
    useProgress,
} from "@react-three/drei";
import * as THREE from "three";

/*
ModelViewerComponent

Renders one or more GLB files sharing a single PBR texture set.

Inputs:
  baseURL    — S3/CloudFront prefix that all keys are joined to.
                 Example: "https://s3.../static/models/chair0/"
  modelURL   — array of keys (relative to baseURL) for GLB files.
                 Multiple entries are rendered together in the same scene,
                 used when a model's geometry is split across files.
  textureURL — array of keys (relative to baseURL) for the PBR maps.
                 Files are matched by filename: BaseColor / Normal /
                 Roughness / Metallic. Order in the array does not matter.
*/

interface ModelViewerProps {
    baseURL: string;
    modelURL: string[];
    textureURL: string[];
}

// Hardcoded environment used for image-based lighting
const HDRI_URL =
    "https://d2fhlomc9go8mv.cloudfront.net/static/hdri/rural_asphalt_road_256p.exr";

/*
LoaderOverlay

Lives outside the Canvas as a regular DOM node. Reading useProgress
from inside an Html fallback causes setState-in-render warnings when
useGLTF / Environment resolve, because three's LoadingManager fires
its onLoad callback synchronously while Loader is still mounted.
Mounting the overlay as a sibling of the Canvas avoids the issue.
*/
function LoaderOverlay() {
    const { progress, active } = useProgress();
    if (!active) return null;
    return (
        <div
            className="model-view-loading"
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
            }}
        >
            <p>{progress.toFixed(2)}% LOADED</p>
        </div>
    );
}

// Join a base URL and a key without doubling or dropping the slash.
function joinURL(base: string, key: string): string {
    const b = base.endsWith("/") ? base : base + "/";
    const k = key.startsWith("/") ? key.slice(1) : key;
    return b + k;
}

interface MatchedTextures {
    color?: string;
    normal?: string;
    roughness?: string;
    metallic?: string;
}

// Identify which map each texture file represents based on its filename.
// Case-insensitive so "basecolor", "BaseColor", "BASECOLOR" all match.
function matchTextures(baseURL: string, keys: string[]): MatchedTextures {
    const out: MatchedTextures = {};
    for (const key of keys) {
        const lower = key.toLowerCase();
        const url = joinURL(baseURL, key);
        if (lower.includes("basecolor") || lower.includes("albedo")) {
            out.color = url;
        } else if (lower.includes("normal")) {
            out.normal = url;
        } else if (lower.includes("roughness")) {
            out.roughness = url;
        } else if (lower.includes("metallic") || lower.includes("metalness")) {
            out.metallic = url;
        }
    }
    return out;
}

export default function ModelViewerComponent({
                                                 baseURL,
                                                 modelURL,
                                                 textureURL,
                                             }: ModelViewerProps) {
    const modelURLs = useMemo(
        () => modelURL.map((k) => joinURL(baseURL, k)),
        [baseURL, modelURL]
    );
    const textures = useMemo(
        () => matchTextures(baseURL, textureURL),
        [baseURL, textureURL]
    );

    return (
        <div
            className="model-view-module-compact"
            style={{ position: "relative", width: "100%", height: "100%" }}
        >
            <Canvas camera={{ position: [1.2, 0.9, 1.2], fov: 53 }}>
                <Suspense fallback={null}>
                    <GLTFComponent modelURLs={modelURLs} textures={textures} />
                    <Environment files={HDRI_URL} />
                </Suspense>
                <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
            </Canvas>
            <LoaderOverlay />
        </div>
    );
}

interface GLTFComponentProps {
    modelURLs: string[];
    textures: MatchedTextures;
}

/*
GLTFComponent

Loads each GLB and walks its scene graph for meshes. Every mesh is
rendered with a shared MeshStandardMaterial built from the matched
texture set, so the same PBR maps cover geometry that may be split
across multiple GLB files.
*/
function GLTFComponent({ modelURLs, textures }: GLTFComponentProps) {
    const material = usePBRMaterial(textures);

    return (
        <>
            {modelURLs.map((url) => (
                <GLBMeshes key={url} url={url} material={material} />
            ))}
        </>
    );
}

interface GLBMeshesProps {
    url: string;
    material: THREE.Material;
}

function GLBMeshes({ url, material }: GLBMeshesProps) {
    const { scene } = useGLTF(url);

    // Collect all meshes from the loaded scene graph. A single GLB may
    // contain multiple meshes nested under groups, so a flat traversal
    // is more reliable than indexing into `nodes`.
    const meshes = useMemo(() => {
        const collected: THREE.Mesh[] = [];
        scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
                collected.push(obj as THREE.Mesh);
            }
        });
        return collected;
    }, [scene]);

    return (
        <>
            {meshes.map((mesh, i) => (
                <mesh
                    key={`${url}-${i}`}
                    geometry={mesh.geometry}
                    material={material}
                    position={mesh.position}
                    rotation={mesh.rotation}
                    scale={mesh.scale}
                />
            ))}
        </>
    );
}

/*
usePBRMaterial

Builds a single MeshStandardMaterial from the matched texture URLs.
Maps that the caller didn't provide are simply omitted, so this works
with partial texture sets (e.g. color-only).
*/
function usePBRMaterial(textures: MatchedTextures): THREE.MeshStandardMaterial {
    const urls = [
        textures.color,
        textures.normal,
        textures.roughness,
        textures.metallic,
    ].filter((u): u is string => Boolean(u));

    const loaded = useLoader(THREE.TextureLoader, urls);

    return useMemo(() => {
        // Re-associate the loaded textures with their slot by walking
        // the same order we passed to useLoader.
        let i = 0;
        const colorMap = textures.color ? loaded[i++] : undefined;
        const normalMap = textures.normal ? loaded[i++] : undefined;
        const roughnessMap = textures.roughness ? loaded[i++] : undefined;
        const metalnessMap = textures.metallic ? loaded[i++] : undefined;

        // GLTF convention: textures are not flipped on the Y axis the way
        // the default TextureLoader assumes for image-based maps.
        [colorMap, normalMap, roughnessMap, metalnessMap].forEach((t) => {
            if (t) t.flipY = false;
        });

        if (colorMap) colorMap.colorSpace = THREE.SRGBColorSpace;

        return new THREE.MeshStandardMaterial({
            map: colorMap,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
            metalnessMap: metalnessMap,
            // When a metalness map is supplied, the scalar acts as a
            // multiplier — 1.0 lets the map drive the result fully.
            metalness: metalnessMap ? 1.0 : 0.0,
            roughness: 1.0,
        });
    }, [loaded, textures]);
}