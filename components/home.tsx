'use client';
import { useTheme } from "next-themes";
import { useState } from "react";
import Markdown from 'react-markdown';

const comingsoonmessage: string = "Friend, I've moved to Austin, Texas, and am putting together several updates for this domain. Stay tuned.";

const copy: string = "A programmer and 3D artist based in Austin, Texas with a penchant for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  ";

export default function HomeComponent() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { theme, setTheme } = useTheme();
    const markdownStyle: React.CSSProperties = {
        color: 'var(--text-primary)',
    };
    return (
        <>
            <div className="home-container">
                <div className="home-content ">
                    <div className={"rogerlib-card"}>
                        <img className={"rogerlib-logo"} src={theme === 'dark' ? "https://s3.us-east-2.amazonaws.com/static.rogerlib.com/static/graphics/logo_rogerlib_white.svg" : "https://s3.us-east-2.amazonaws.com/static.rogerlib.com/static/graphics/logo_rogerlib_black.svg"}/>
                        <div className={"rogerlib-info"}>
                            <p>
                                ROGER MOTORSPORTS LIBRARY
                            </p>
                            <p>
                                STATUS: ONLINE
                            </p>
                            <a className="rogerlib-link"
                               href="https://rogerlibrary.com">
                                <p>[EXTERNAL] VISIT NOW</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}