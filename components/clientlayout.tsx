'use client';
import * as React from "react"
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react';

import Navigation from './navigation';
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
  const [isContactPage, setIsContactPage] = useState(false);
  const compactView = useDevice();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContactPage(pathname === '/cntct');
    }, 50);
    
    return () => clearTimeout(timer);
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
      <Navigation/>
      <main>
        <div className="main-container">
          {!compactView && (
            <div className="cursor-canvas">
              <div
                style={{
                  ...styles.orb,
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
                  opacity: isVisible ? 1 : 0,
                }}
              >
                <div style={styles.orbHighlight} />
                <div style={styles.orbInner} />
                <div style={styles.orbPulse} />
              </div>
            </div>
          )}
          <div className="base-container">
            <div className="base-header">
              <div className={`base-header ${isContactPage ? 'base-header-large' : ''}`}>
                  <Link className={"app-header"}
                        href="/"
                  >
                      <h2>ANDY BUI</h2>
                  </Link>
              </div>
            </div>
            <div className="circle-row top">
              <div className="grid-circle-left"/>
            </div>
            <div className="circle-row bottom">
              <div className="grid-circle-left"/>
              <div className="grid-circle-left"/>
            </div>
            {children}
          </div>
        </div>
      </main>
    </DeviceContext.Provider>
  );
}