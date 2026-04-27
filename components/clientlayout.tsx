'use client';
import * as React from "react"
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import Navigation from './navigation';
import { ThemeToggle } from './themetoggle';
import { DeviceContext } from '../context/devicecontext';
import { useDevice } from '../hooks/useDevice';
import Link from "next/link";
import { MAINTENANCE_MODE } from '../lib/siteconfig';
import Maintenance from "./maintenance";

const styles = {
    orb: {
        position: 'fixed' as const,
        pointerEvents: 'none' as const,
        zIndex: 50,
        transform: 'translate(-50%, -50%)',
        transition: 'opacity 0.3s ease',
    },
    orbInner: {
        width: '64px',
        height: '64px',
        background: 'linear-gradient(135deg,rgb(0, 85, 255) 0%,rgb(7, 0, 133) 100%)',
        borderRadius: '50%',
        willChange: 'transform',
        filter: 'blur(0px)',
        opacity: 0.8,
    },
    orbPulse: {
        position: 'absolute' as const,
        inset: 8,
        width: '44px',
        height: '44px',
        background: 'linear-gradient(135deg,rgb(0, 255, 13) 0%,rgb(60, 255, 0) 100%)',
        borderRadius: '50%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        filter: 'blur(6px)',
    },
    orbHighlight: {
        position: 'absolute' as const,
        inset: 16,
        width: '16px',
        height: '16px',
        background: 'linear-gradient(135deg,rgb(245, 245, 245) 0%,rgb(243, 255, 239) 100%)',
        borderRadius: '50%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        filter: 'blur(4px)',
        zIndex: '50'
    },
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [temperature, setTemperature] = useState<number | null>(null);

    const targetPositionRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | undefined>(undefined);
    const pathname = usePathname();
    const compactView = useDevice();
    const { theme, setTheme } = useTheme();

    const navItemStyle: React.CSSProperties = {
        backgroundColor: 'var(--nav-item-primary)',
        color: 'var(--nav-item-text)',
    }
    useEffect(() => {
        fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=30.2672&longitude=-97.7431&current=temperature_2m&temperature_unit=fahrenheit&forecast_days=1'
        )
            .then(res => res.json())
            .then(data => {
                const temp = data?.current?.temperature_2m;
                if (typeof temp === 'number') {
                    setTemperature(Math.round(temp));
                }
            })
            .catch(() => {
                // fail silently — puck renders without temperature
            });
    }, []);
    // Layout debug flag.
    // Reads `?debug=1` from the URL and toggles the `debug-layout` class
    // on <html>. The class activates the --debug-N variables defined in
    // globals.css. Re-checks on pathname changes so client-side navigation
    // that drops the param turns the tints off.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const debug = params.get('debug') === '1';
        document.documentElement.classList.toggle('debug-layout', debug);
    }, [pathname]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isVisible) {
            // Initialize position immediately on first move
            setPosition({ x: e.clientX, y: e.clientY });
            targetPositionRef.current = { x: e.clientX, y: e.clientY };
            setIsVisible(true);
        } else {
            targetPositionRef.current = { x: e.clientX, y: e.clientY };
        }
    }, [isVisible]);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        if (compactView) return;

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [handleMouseMove, handleMouseLeave, handleMouseEnter, compactView]);

    useEffect(() => {
        if (compactView || !isVisible) return;

        const animate = () => {
            setPosition((prev) => {
                const target = targetPositionRef.current;
                const dx = target.x - prev.x;
                const dy = target.y - prev.y;

                // Use a threshold to stop updates when close enough
                if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                    return {
                        x: prev.x + dx * 0.1,
                        y: prev.y + dy * 0.1,
                    };
                }
                return prev;
            });

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [compactView, isVisible]);

    return (
        <DeviceContext.Provider value={compactView}>
            <main>
                {!compactView && (
                    <div className="cursor-canvas">
                        <div
                            style={{
                                ...styles.orb,
                                transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
                            }}
                        >
                            <div style={styles.orbHighlight} />
                            <div style={styles.orbInner} />
                            <div style={styles.orbPulse} />
                        </div>
                    </div>
                )}
                <div className="main-container">
                    <div className={"navigation-container liquid-glass"}>
                        <div className={"navigation-container-inner"}>
                            <Link style={navItemStyle} className={"navigation-item-left liquid-glass"} href={"/about"}>
                                <div className={"navigation-item-inner"}>
                                    <h2>ABOUT</h2>
                                </div>
                            </Link>
                            <Link style={navItemStyle}  className={"navigation-item liquid-glass"} href={"/"}>
                                <div className={"navigation-item-inner"}>
                                    <h2>PROJECTS</h2>
                                </div>
                            </Link>
                            <Link style={navItemStyle}  className={"navigation-item liquid-glass"} href={"/"}>
                                <div className={"navigation-item-inner"}>
                                    <h2>WRITING</h2>
                                </div>
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div className="base-container liquid-glass-main">
                        <div className={"puck-container"}>
                            <svg width="0" height="0" style={{ position: 'absolute' }}>
                                <defs>
                                    <clipPath id="puck-clip" clipPathUnits="userSpaceOnUse">
                                        <clipPath id="puck-clip" clipPathUnits="userSpaceOnUse">
                                            <path clipRule="evenodd" d="
    M 12 0 L 176 0 Q 192 0 192 16 L 192 84 Q 192 96 180 96
    L 46.49 96 Q 39.55 96 34.91 91.35 L 4.65 66.49
    Q 0 61.45 0 54.51 L 0 12 Q 0 0 12 0 Z
    M 168 8 L 176 8 Q 184 8 184 16 L 184 24
    Q 184 32 176 32 L 168 32 Q 160 32 160 24
    L 160 16 Q 160 8 168 8 Z
"/>
                                        </clipPath>
                                    </clipPath>
                                </defs>
                            </svg>
                            <div style={{
                                display: 'grid',
                                gridTemplateRows: 'auto',
                                gridTemplateColumns: 'auto',
                                width: '100%',
                                height: '100%',
                                background: 'var(--text-dark)',
                                clipPath: "url(#puck-clip)",
                            }}>

                                <p className={'puck-paragraph'}>AUSTIN, TX</p>
                                {temperature !== null && (
                                    <p className={'puck-temperature'}>{temperature}°F</p>
                                )}
                            </div>
                        </div>

                        <div className={`base-header`}>
                            {!MAINTENANCE_MODE && (
                                <Link className={"app-header"}
                                      href="/"
                                >
                                    <h2>ANDY BUI</h2>
                                </Link>
                            )}
                        </div>
                        {MAINTENANCE_MODE ? (
                            <Maintenance />
                        ) : (
                            <>
                                {children}
                            </>

                        )}
                    </div>
                </div>
            </main>
        </DeviceContext.Provider>
    );
}