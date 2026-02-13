'use client';
import { useState } from "react";
import Markdown from 'react-markdown';

const comingsoonmessage: string = "Friend, I've moved to Austin, Texas, and am putting together several updates for this domain. Stay tuned.";

const copy: string = "A programmer and 3D artist based in Austin, Texas with a penchant for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  ";

export default function HomeComponent() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const markdownStyle: React.CSSProperties = {
        color: 'var(--text-primary)',
    };
    return (
        <>
            <div className="home-container">
                <div className="home-content ">
                    <div draggable
                         className="home-sheet sheet liquid-glass"
                         style={{
                             position: 'absolute',
                             transform: `translate(${position.x}px, ${position.y}px) rotate(${-2}deg)`,
                             mixBlendMode: 'multiply',
                             cursor: 'move',
                             transition: 'transform 0.1s ease-out'
                         }}
                    >
                        <p>{copy}</p>
                    </div>
                </div>
            </div>
        </>
    );
}