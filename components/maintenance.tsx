import * as React from 'react';
import ModelViewerComponent from "./modelViewer";
import { useEffect, useState } from "react";

export default function Maintenance() {
    const modelURL: string = "gltf/chairProgramme.glb";
    const textureURL: string[] = [
            "tex/2048p/chairProgramme_BaseColor_sRGB.jpg",
        "tex/2048p/chairProgramme_Normal_Raw.jpg",
        "tex/2048p/chairProgramme_Roughness_Raw.jpg",
        "tex/2048p/chairProgramme_Metallic_Raw.jpg",
];
    const baseURL: string = "https://s3.us-east-2.amazonaws.com/static.rogerlib.com/static/models/chair0/";
    const [debug, setDebug] = useState<boolean>(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const debug = params.get('debug') === '1';
        setDebug(debug);
    },[]);
    return (
        <div className="home-container">
        <div
            style={{
                width: '100%',
                height: '100%',
                maxWidth: '48rem',
                maxHeight: '36rem',
                margin: 'auto',
                display: 'grid',
                gridTemplateColumns: 'auto',
                gridTemplateRows: 'auto',
                gap: '1rem',
                color: 'var(--text-primary)',
                fontFamily: 'Swiss721, sans-serif',
            }}
        >
            <div className="maintenance-notice" style={{
                gridArea: '2 / 1 / -1 / -1',
                backgroundColor: 'var(--debug-2)',
                width: 'calc(100% - 1.0rem)',
                maxWidth: '24.0rem',
                height: '8.0rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                zIndex: '10',
            }}>
                <h1 style={{ fontSize: '2.7rem', fontWeight: 300, lineHeight: '2.8rem' }}>
                    ANDY BUI
                </h1>
                <p style={{ fontSize: '1.4rem', marginTop: '0rem', lineHeight: '1.4rem', fontWeight: 200 }}>
                    UNDER CONSTRUCTION
                </p>
                <p style={{
                    fontSize: '1.0rem',
                    textAlign: 'right',
                    margin: 'auto',
                    marginBottom: '0',
                    marginLeft: '0',
                    fontWeight: 200,
                    opacity: 0.7,
                    backgroundColor: 'var(--debug-3)'
                }}>
                    Back shortly. In the meantime: a@ndybui.dev
                </p>
            </div>

            <div style={{
                gridArea: '2 / 1 / -1 / -1',
                width: "100%",
                maxWidth: "48rem",
                maxHeight: "36rem",
                height: "100%",
                backgroundColor: 'var(--debug-3)'
            }}>
                <ModelViewerComponent baseURL={baseURL} modelURL={[modelURL]} textureURL={textureURL} debug={debug}/>
            </div>
        </div>
        </div>
    );
}