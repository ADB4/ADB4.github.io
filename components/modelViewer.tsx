import * as React from "react";
import { Suspense, useMemo, useRef, useState, useEffect, useCallback } from "react";
import { Canvas, useLoader, useFrame, useThree } from "@react-three/fiber";
import {
    Bounds,
    Environment,
    OrbitControls,
    useBounds,
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
  debug      — optional. When true, an overlay shows the live camera
                 position / target / fov and lets you save snapshots
                 for use as fixed views later. Defaults to false.

Sizing:
  The component fills its parent. Because the wrapper may sit inside a
  flex/grid cell that collapses without a determinate height, we
  measure the parent element via a ResizeObserver and apply pixel
  width/height directly. Until the first measurement lands, the
  wrapper falls back to width:100% / height:100%, so the canvas still
  renders something on the initial mount in cases where the parent is
  already sized correctly.

Framing:
  drei's <Bounds> wraps the loaded model. The fit pass is invoked
  IMPERATIVELY by <BoundsFitter>:

    - Once on geometry change (fitKey).
    - On viewport resize, ONLY when the model would otherwise be
      clipped at the current camera distance.

  Why clip-aware rather than always: an unconditional refit on every
  resize cancels user-driven zoom (e.g. mobile URL bar showing/hiding,
  scrollbar appearance, font reflow all fire ResizeObserver). The
  clip-aware path leaves the camera alone when the bounding sphere
  still projects inside the viewport with the configured margin, so
  zoom is preserved unless the viewport actually shrinks past the
  model's projected extent.

Stability:
  Every prop that flows into the <Canvas> subtree is referentially
  stable across renders. Changes to those references can remount
  scene-graph nodes mid-frame and cause the Bounds fit to retrigger
  or shaders to recompile, which manifests as visible jitter. The
  pattern is to depend on string keys (joined URL lists) rather than
  the raw arrays from props.
*/

interface ModelViewerProps {
    baseURL: string;
    modelURL: string[];
    textureURL: string[];
    debug?: boolean;
}

// Hardcoded environment used for image-based lighting
const HDRI_URL =
    "https://d2fhlomc9go8mv.cloudfront.net/static/hdri/rural_asphalt_road_256p.exr";

/*
DEFAULT_CAMERA

The starting view. Bounds will dolly along the (position - target)
direction to frame the model on the initial fit, so what really
matters here is the view angle; the magnitude is overwritten by
that one fit pass. fov is preserved.
*/
const DEFAULT_CAMERA = {
    position: [3.448, 1.875, -2.262] as [number, number, number], target: [0.217, -0.013, -0.260] as [number, number, number], fov: 53.000
};

// Margin used by Bounds.fit() and by the clip-aware resize check.
// Kept as a single constant so both paths stay in sync.
const FIT_MARGIN = 1.1;

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

/*
CameraSnapshot

Shape of the data the debug readout exposes. Both the live position
and the OrbitControls target are tracked because a fixed camera in
the future will need both to reproduce a view exactly.
*/
interface CameraSnapshot {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
}

/*
CameraReadoutBus

Subscription primitive shared between the inside of the Canvas
(producer) and the DOM overlay (consumer). The producer writes into
a ref every frame and notifies subscribers on a throttled cadence;
the consumer subscribes via a hook.

This pattern is what keeps the Canvas tree from re-rendering when
the debug overlay updates. Calling setState in the parent of <Canvas>
would otherwise cascade through every memoized prop and risk
remounting scene graph nodes, which produces frame-to-frame jitter.
*/
type Listener = (snap: CameraSnapshot) => void;

interface CameraReadoutBus {
    snapshotRef: React.MutableRefObject<CameraSnapshot>;
    write: (snap: CameraSnapshot) => void;
    subscribe: (listener: Listener) => () => void;
}

function createCameraReadoutBus(initial: CameraSnapshot): CameraReadoutBus {
    const snapshotRef = { current: initial } as React.MutableRefObject<CameraSnapshot>;
    const listeners = new Set<Listener>();
    return {
        snapshotRef,
        write(snap) {
            snapshotRef.current = snap;
            listeners.forEach((l) => l(snap));
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
    };
}

/*
CameraReadout

Lives inside the Canvas so it can read camera state every frame via
useFrame. Throttles bus writes to ~10Hz so the overlay text stays
legible while still feeling live during drags.
*/
interface CameraReadoutProps {
    bus: CameraReadoutBus;
}

function CameraReadout({ bus }: CameraReadoutProps) {
    const { camera, controls } = useThree();
    const lastEmitRef = useRef<number>(0);
    const tmpTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());

    useFrame(() => {
        const persp = camera as THREE.PerspectiveCamera;
        const orbit = controls as unknown as { target?: THREE.Vector3 } | null;
        const target = orbit?.target ?? tmpTargetRef.current;

        // Always update the ref so handleSave reflects the latest frame.
        bus.snapshotRef.current = {
            position: [persp.position.x, persp.position.y, persp.position.z],
            target: [target.x, target.y, target.z],
            fov: persp.fov,
        };

        const now = performance.now();
        if (now - lastEmitRef.current > 100) {
            lastEmitRef.current = now;
            bus.write(bus.snapshotRef.current);
        }
    });

    return null;
}

/*
DebugOverlay

DOM-side overlay that renders the live readout and the list of saved
positions. Subscribes to the bus directly, so its state changes never
touch the Canvas tree.
*/
interface DebugOverlayProps {
    bus: CameraReadoutBus;
    onSave: () => void;
    saved: CameraSnapshot[];
    onClear: () => void;
    onRemove: (index: number) => void;
}

function fmt(n: number): string {
    return n.toFixed(3);
}

function snapshotToCode(snap: CameraSnapshot): string {
    const p = snap.position.map(fmt).join(", ");
    const t = snap.target.map(fmt).join(", ");
    return `position: [${p}], target: [${t}], fov: ${fmt(snap.fov)}`;
}

function DebugOverlay({ bus, onSave, saved, onClear, onRemove }: DebugOverlayProps) {
    const [live, setLive] = useState<CameraSnapshot>(bus.snapshotRef.current);

    useEffect(() => {
        return bus.subscribe(setLive);
    }, [bus]);

    const copy = (text: string) => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(text).catch(() => {
                /* clipboard may be blocked; ignore */
            });
        }
    };

    return (
        <div
            style={{
                position: "absolute",
                top: "0.5rem",
                left: "0.5rem",
                maxWidth: "calc(100% - 1rem)",
                padding: "0.5rem 0.6rem",
                background: "rgba(0, 0, 0, 0.55)",
                color: "#e6e6e6",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "0.75rem",
                lineHeight: 1.4,
                borderRadius: "0.25rem",
                pointerEvents: "auto",
                zIndex: 20,
                userSelect: "text",
            }}
        >
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem" }}>
                <strong style={{ fontWeight: 600 }}>CAMERA</strong>
                <button type="button" onClick={onSave} style={debugButtonStyle}>
                    save
                </button>
                <button
                    type="button"
                    onClick={() => copy(snapshotToCode(live))}
                    style={debugButtonStyle}
                >
                    copy
                </button>
                {saved.length > 0 && (
                    <button type="button" onClick={onClear} style={debugButtonStyle}>
                        clear
                    </button>
                )}
            </div>

            <div>pos&nbsp;&nbsp;[{live.position.map(fmt).join(", ")}]</div>
            <div>tgt&nbsp;&nbsp;[{live.target.map(fmt).join(", ")}]</div>
            <div>fov&nbsp;&nbsp;{fmt(live.fov)}</div>

            {saved.length > 0 && (
                <div
                    style={{
                        marginTop: "0.4rem",
                        borderTop: "1px solid rgba(255,255,255,0.2)",
                        paddingTop: "0.3rem",
                    }}
                >
                    <div style={{ marginBottom: "0.2rem", opacity: 0.7 }}>
                        SAVED ({saved.length})
                    </div>
                    {saved.map((snap, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                gap: "0.4rem",
                                alignItems: "flex-start",
                                marginBottom: "0.15rem",
                            }}
                        >
                            <span style={{ opacity: 0.6, minWidth: "1.2rem" }}>#{i}</span>
                            <span style={{ flex: 1, wordBreak: "break-all" }}>
                                {snapshotToCode(snap)}
                            </span>
                            <button
                                type="button"
                                onClick={() => copy(snapshotToCode(snap))}
                                style={debugButtonStyle}
                            >
                                copy
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemove(i)}
                                style={debugButtonStyle}
                            >
                                x
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const debugButtonStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.1)",
    color: "#e6e6e6",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "0.15rem",
    padding: "0.05rem 0.35rem",
    fontFamily: "inherit",
    fontSize: "0.7rem",
    cursor: "pointer",
};

/*
BoundsFitter

Drives the Bounds fit pass. Lives as a child of <Bounds>, so
useBounds() resolves to the api created by the nearest Bounds parent.

Two fit triggers:

  1. Geometry change (fitKey). Always re-fits, full reset of camera
     distance. This is the canonical "load a new model" path.

  2. Viewport resize. Re-fits ONLY when the model's bounding sphere
     no longer projects inside the viewport with the configured
     margin at the current camera distance.

The clip-aware path is what preserves user zoom across resizes.
<Bounds observe> would call fit() on every resize unconditionally,
which both wipes user zoom and causes jitter when sub-pixel resize
ticks fire mid-drag. By only refitting on actual clipping, we keep
user zoom intact when the resize doesn't push the model out of view.

Geometry-fit timing:
  We wait one rAF after the geometry mounts so the GLBs have
  finished their Suspense resolution and the parent group has its
  final transform. Calling refresh()/fit() before the scene graph
  is settled produces an off-center frame.

Clip detection math:
  Given the camera-to-target distance d, the perspective half-height
  at that distance is d * tan(fov/2), and the half-width is that
  times aspect. Multiplying by FIT_MARGIN gives the threshold the
  bounding sphere radius must stay under to be considered framed.
  We additionally guard against the camera being inside or past the
  bounding sphere (d <= radius) by treating that as clipped.
*/
interface BoundsFitterProps {
    fitKey: string;
}

function BoundsFitter({ fitKey }: BoundsFitterProps) {
    const api = useBounds();
    const { scene, camera, size } = useThree();

    // Re-fit on geometry change. Runs once per fitKey, after one rAF
    // so the Suspense-resolved geometry has its final transform.
    useEffect(() => {
        const id = requestAnimationFrame(() => {
            api.refresh().clip().fit();
        });
        return () => cancelAnimationFrame(id);
    }, [api, fitKey]);

    // Re-fit on resize, but only when the model would clip.
    //
    // We depend on size.width / size.height from useThree, which
    // r3f updates whenever the canvas's underlying drawing buffer
    // resizes. That covers parent resize, DPR changes, and any
    // other path that changes the canvas dimensions.
    useEffect(() => {
        // Skip on the initial mount: the geometry-fit effect above
        // already runs on the first frame, so there is nothing to
        // check before that has had a chance to settle.
        if (size.width === 0 || size.height === 0) return;

        // Defer one frame so any in-flight geometry fit completes
        // before we measure. Without this, a resize that arrives
        // simultaneously with a model swap would observe the old
        // camera distance against the new geometry and double-fit.
        const id = requestAnimationFrame(() => {
            const persp = camera as THREE.PerspectiveCamera;

            // Recompute the bounding sphere from the current scene
            // graph. Cheap relative to the cost of a wrong refit.
            const box = new THREE.Box3().setFromObject(scene);
            if (box.isEmpty()) return;
            const sphere = new THREE.Sphere();
            box.getBoundingSphere(sphere);
            if (sphere.radius <= 0) return;

            // Distance from camera to the bounding sphere center.
            // Using the sphere center rather than the OrbitControls
            // target keeps the math correct even if the user has
            // panned the target away from the model.
            const d = persp.position.distanceTo(sphere.center);

            // Camera inside or beyond the sphere — treat as clipped.
            if (d <= sphere.radius) {
                api.refresh().clip().fit();
                return;
            }

            // Half-extents of the viewport at distance d, in world
            // units. tan() expects radians; r3f's PerspectiveCamera
            // stores fov in degrees.
            const halfFovRad = (persp.fov * Math.PI) / 180 / 2;
            const halfHeight = Math.tan(halfFovRad) * d;
            const halfWidth = halfHeight * persp.aspect;

            // The bounding sphere stays framed when its radius fits
            // inside the smaller half-extent, scaled by the margin.
            // (Sphere is rotation-invariant, so we don't need to
            //  project corners — radius alone is the worst case.)
            const minHalfExtent = Math.min(halfHeight, halfWidth);
            const allowed = minHalfExtent / FIT_MARGIN;

            if (sphere.radius > allowed) {
                api.refresh().clip().fit();
            }
        });
        return () => cancelAnimationFrame(id);
    }, [api, scene, camera, size.width, size.height]);

    return null;
}

export default function ModelViewerComponent({
                                                 baseURL,
                                                 modelURL,
                                                 textureURL,
                                                 debug = false,
                                             }: ModelViewerProps) {
    /*
      Stable scalar keys.

      Joining the URL lists into strings gives us memo dependencies
      that compare by value, not identity. The caller passes a fresh
      array literal on every render; without these keys, every memo
      below would invalidate on every parent render, cascading down
      into the scene graph.
    */
    const modelKey = useMemo(() => modelURL.join("|"), [modelURL]);
    const textureKey = useMemo(() => textureURL.join("|"), [textureURL]);

    const modelURLs = useMemo(
        () => modelURL.map((k) => joinURL(baseURL, k)),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [baseURL, modelKey]
    );
    const textures = useMemo(
        () => matchTextures(baseURL, textureURL),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [baseURL, textureKey]
    );

    // Stable identifier for the loaded geometry set. Used by
    // <BoundsFitter> to decide when to re-run the fit pass.
    const fitKey = useMemo(() => `${baseURL}::${modelKey}`, [baseURL, modelKey]);

    // Bus is created exactly once per mount. The CameraReadout writes
    // into it every frame; the DebugOverlay subscribes to it.
    const initialSnapshot = useMemo<CameraSnapshot>(
        () => ({
            position: DEFAULT_CAMERA.position,
            target: DEFAULT_CAMERA.target,
            fov: DEFAULT_CAMERA.fov,
        }),
        []
    );
    const busRef = useRef<CameraReadoutBus | null>(null);
    if (busRef.current === null) {
        busRef.current = createCameraReadoutBus(initialSnapshot);
    }
    const bus = busRef.current;

    const [saved, setSaved] = useState<CameraSnapshot[]>([]);

    const handleSave = useCallback(() => {
        const s = bus.snapshotRef.current;
        setSaved((prev) => [
            ...prev,
            {
                position: [...s.position] as [number, number, number],
                target: [...s.target] as [number, number, number],
                fov: s.fov,
            },
        ]);
    }, [bus]);

    const handleClear = useCallback(() => setSaved([]), []);
    const handleRemove = useCallback(
        (index: number) =>
            setSaved((prev) => prev.filter((_, i) => i !== index)),
        []
    );

    /*
      Parent measurement.

      The wrapper is the Canvas's host element. r3f's <Canvas>
      measures its container with a ResizeObserver and propagates
      the result via useThree().size, so the canvas tracks whatever
      size we apply here.

      In flex/grid layouts where the parent cell can collapse without
      a determinate height, percentage sizes resolve to zero and the
      canvas renders at 0x0. To handle that, we observe the parent
      element directly and apply pixel dimensions sourced from its
      content box. The observer runs on every parent resize, so the
      canvas stays in sync without any caller-side changes.

      Until the first measurement lands, we render at 100%/100% so
      the canvas still appears immediately when the parent has its
      own determinate size (the common case).
    */
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [parentSize, setParentSize] = useState<{ w: number; h: number } | null>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const parent = wrapper.parentElement;
        if (!parent) return;

        const measure = () => {
            const rect = parent.getBoundingClientRect();
            // Round to the nearest device pixel to avoid sub-pixel
            // ResizeObserver noise that would otherwise feed back
            // into the clip-aware refit logic on every wobble.
            const w = Math.round(rect.width);
            const h = Math.round(rect.height);
            setParentSize((prev) => {
                if (prev && prev.w === w && prev.h === h) return prev;
                return { w, h };
            });
        };

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(parent);
        return () => observer.disconnect();
    }, []);

    // Apply pixel sizes once measured; fall back to 100%/100% before
    // the first measurement so we don't flash 0x0.
    const wrapperSize: React.CSSProperties = parentSize
        ? { width: `${parentSize.w}px`, height: `${parentSize.h}px` }
        : { width: "100%", height: "100%" };

    return (
        <div
            ref={wrapperRef}
            className="model-view-module-compact"
            style={{
                position: "relative",
                overflow: "hidden",
                ...wrapperSize,
            }}
        >
            <div style={{ position: "absolute", inset: 0 }}>
                <Canvas
                    camera={{
                        position: DEFAULT_CAMERA.position,
                        fov: DEFAULT_CAMERA.fov,
                    }}
                >
                    <Suspense fallback={null}>
                        {/*
                          Bounds is used IMPERATIVELY here: no `fit`,
                          no `observe`. <BoundsFitter> drives the fit
                          pass on geometry change and on clip-detected
                          resize. See its docblock for the rationale.
                        */}
                        <Bounds margin={FIT_MARGIN}>
                            <BoundsFitter fitKey={fitKey} />
                            <GLTFComponent modelURLs={modelURLs} textures={textures} />
                        </Bounds>
                        <Environment files={HDRI_URL} />
                    </Suspense>
                    {/*
                      Damping disabled. enableDamping makes OrbitControls
                      integrate the camera every frame toward an internal
                      target; even without Bounds writing the camera, the
                      damping integration adds latency to user input and
                      can interact badly with rapid wheel events.
                    */}
                    <OrbitControls
                        makeDefault
                        target={DEFAULT_CAMERA.target}
                    />
                    {debug && <CameraReadout bus={bus} />}
                </Canvas>
            </div>
            <LoaderOverlay />
            {debug && (
                <DebugOverlay
                    bus={bus}
                    onSave={handleSave}
                    saved={saved}
                    onClear={handleClear}
                    onRemove={handleRemove}
                />
            )}
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