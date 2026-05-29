'use client';
import * as React from "react"
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useTheme } from 'next-themes';
import Navigation from './navigation';
import { ThemeToggle } from './themetoggle';
import { DeviceContext } from '../context/devicecontext';
import { useDevice } from '../hooks/useDevice';
import Link from "next/link";
import { MAINTENANCE_MODE } from '../lib/siteconfig';
import Maintenance from "./maintenance";

function Loader() {
    return (
        <p className={'puck-temperature'}>LOADING</p>)
}

function TemperatureComponent(){
    const [temperature, setTemperature] = useState<number>(null);
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
    return (
        <>
            <p className={'puck-temperature'}>
                {temperature === null ? 'LOADING...' : `${temperature} DEG F`}
            </p>
        </>

    )
}

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
                <div className="main-container">
                    <div className={"navigation-container liquid-glass"}>
                        <div className={"navigation-container-inner"}>
                            <Link style={navItemStyle}  className={"navigation-item-left liquid-glass"} href={"/"}>
                                <div className={"navigation-item-inner"}>
                                    <h2>PROJECTS</h2>
                                </div>
                            </Link>
                            <Link style={navItemStyle}  className={"navigation-item liquid-glass"} href={"/writing"}>
                                <div className={"navigation-item-inner"}>
                                    <h2>WRITING</h2>
                                </div>
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div className="base-container liquid-glass-main">
                        <div className={"puck-container"}>
                            <p className={'puck-paragraph'}>AUSTIN, TX</p>
                                <Suspense fallback={<Loader />}>
                                    <TemperatureComponent />
                                </Suspense>
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