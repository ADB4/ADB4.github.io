'use client';
import * as React from "react"

import Navigation from './navigation';
import ThemeToggle from './themetoggle';
import { ColorModeContext } from '../context/themecontext';
import TypewriterComponent from './typewriter';
const copy: string = "A programmer and 3D artist based in Austin, Texas with a penchant for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  ";

const bgcopy: string = 'ROGER MOTORSPORTS LIBRARY is a repository of 3D assets made by Andy Bui. It is a web application created with ReactJS and Flask that features a model gallery, interactive model viewer, and downloads served from Amazon S3. Roger Motorsports Library is a passion project that is solely maintained by Andy Bui. As much as it is an exercise in web development and interface design, it is also an exploration into the craft of 3D modeling, texturing, and environment art. With the help of HTML, CSS, & JAVASCRIPT ALL-IN-ONE FOR DUMMIES by PAUL MCFREDIES, the application was designed by Andy Bui using the Swiss721, Garamond font families.';
import { useTheme } from 'next-themes'

import { createContext, useLayoutEffect, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark';
const styles = {
  orb: {
    position: 'fixed' as const,
    pointerEvents: 'none' as const,
    zIndex: 50,
    transform: 'translate(-50%, -50%)',
  },
  orbInner: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg,rgb(0, 255, 13) 0%,rgb(60, 255, 0) 100%)',
    borderRadius: '50%',
    willChange: 'transform',
    filter: 'blur(12px)',
    opacity: 0.8,
  },
  orbPulse: {
    position: 'absolute' as const,
    inset: 0,
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg,rgb(0, 4, 255) 0%,rgb(7, 0, 133) 100%)',
    borderRadius: '50%',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    filter: 'blur(8px)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center' as const,
    padding: '32px',
    color: 'white',
    flexDirection: 'column' as const,
  }
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const targetPositionRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetPositionRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    const animate = () => {
      setPosition((prev) => {
        const target = targetPositionRef.current;
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;

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
  }, []);
  return (
    <>
        <Navigation/>
        <main>
            <div className="main-container liquid-glass-main">
              <div className="background-container">
                  <TypewriterComponent text={bgcopy}/>
              </div>
              <div className="cursor-canvas">
                <div
                  style={{
                    ...styles.orb,
                    transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
                  }}
                >
                  <div style={styles.orbInner} />
                  <div style={styles.orbPulse} />
                </div>
              </div>
              <div className="base-container">
                <div className="base-header">
                  <h2>ANDY BUI</h2>
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
    </>
  );
}
