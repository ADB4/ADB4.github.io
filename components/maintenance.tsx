import * as React from 'react';

export default function Maintenance() {
    return (
        <div className="home-container">
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                padding: '2rem',
                color: 'var(--text-primary)',
                fontFamily: 'Swiss721, sans-serif',
            }}
        >
            <h1 style={{ fontSize: '2.4rem', fontWeight: 300 }}>
                ANDY BUI
            </h1>
            <p style={{ fontSize: '1.2rem', fontWeight: 200 }}>
                UNDER CONSTRUCTION
            </p>
            <p style={{ fontSize: '1.0rem', fontWeight: 200, opacity: 0.7 }}>
                Back shortly. In the meantime: a@ndybui.dev
            </p>
        </div>
        </div>
    );
}