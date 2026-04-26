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
                color: 'var(--text-primary)',
                fontFamily: 'Swiss721, sans-serif',
            }}
        >
            <div className="maintenance-notice" style={{
                backgroundColor: 'var(--debug-2)',
                width: 'calc(100% - 1.0rem)',
                maxWidth: '24.0rem',
                height: '8.0rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
            }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 300, lineHeight: '2.8rem' }}>
                    ANDY BUI
                </h1>
                <p style={{ fontSize: '1.4rem', lineHeight: '1.8rem', fontWeight: 200 }}>
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

        </div>
        </div>
    );
}