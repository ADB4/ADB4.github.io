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
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);
  const pathname = usePathname();
  const compactView = useDevice();
  const { theme, setTheme } = useTheme();

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
        <div className="main-container">
          <div className={"navigation-container liquid-glass"}>
              <div className={"navigation-container-inner"}>
                  <Link className={"navigation-item-left liquid-glass"} href={"/about"}>
                      <h2>ABOUT</h2>
                  </Link>
                  <Link className={"navigation-item liquid-glass"} href={"/"}>
                      <h2>PROJECTS</h2>
                  </Link>
                  <Link className={"navigation-item liquid-glass"} href={"/"}>
                      <h2>WRITING</h2>
                  </Link>
                  <ThemeToggle />
              </div>
          </div>

          <div className="base-container liquid-glass-main">
              <div className={"puck-container"}>
                  <div style={{
                      display: 'grid',
                      gridTemplateRows: 'auto',
                      gridTemplateColumns: 'auto',
                      width: '100%',
                      height: '100%',
                      background: 'var(--text-dark)',
                      clipPath: "path('M 12 0 L 180 0 Q 192 0 192 12 L 192 84 Q 192 96 180 96 L 46.49 96 Q 39.55 96 34.91 91.35 L 4.65 66.49 Q 0 61.45 0 54.51 L 0 12 Q 0 0 12 0 Z')",
                  }}>
                      <div style={{
                          gridArea: '1 / 1 / -1 / -1',
                          width: '1rem',
                          height: '1rem',
                          borderRadius: '0.25rem',
                          backgroundColor: 'var(--text-light)',
                          alignSelf: 'start',
                          justifySelf: 'end',
                          margin: '0.5rem',
                          zIndex: 10,
                      }}/>
                      <p className={'puck-paragraph'}>AUSTIN, TX</p>
                  </div>
              </div>

              <div className={`base-header`}>
                  <Link className={"app-header"}
                        href="/"
                  >
                      <h2>ANDY BUI</h2>
                  </Link>
              </div>
            {children}
          </div>
        </div>
      </main>
    </DeviceContext.Provider>
  );
}