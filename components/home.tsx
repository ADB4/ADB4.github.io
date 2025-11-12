'use client';
import Markdown from 'react-markdown';

import { useTheme } from 'next-themes'

const comingsoonmessage: string = "Friend, I've moved to Austin, Texas, and am putting together several updates for this domain. Stay tuned.";

const copy: string = "A programmer and 3D artist based in Austin, Texas with a penchant for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  ";

const bgcopy: string = 'ROGER MOTORSPORTS LIBRARY is a repository of 3D assets made by Andy Bui. It is a web application created with ReactJS and Flask that features a model gallery, interactive model viewer, and downloads served from Amazon S3. Roger Motorsports Library is a passion project that is solely maintained by Andy Bui. As much as it is an exercise in web development and interface design, it is also an exploration into the craft of 3D modeling, texturing, and environment art. With the help of HTML, CSS, & JAVASCRIPT ALL-IN-ONE FOR DUMMIES by PAUL MCFREDIES, the application was designed by Andy Bui using the Swiss721, Garamond font families.';
export default function HomeComponent() {
    const markdownStyle: React.CSSProperties = {
        color: 'var(--text-primary)',
    };
    return (
        <>
            <div className="home-container">
                <div className="home-content">
                    <div className="row-flex-container liquid-glass">
                        <div className="row-content">
                            <Markdown className="markdown-sans-body">
                                {comingsoonmessage}
                            </Markdown>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}