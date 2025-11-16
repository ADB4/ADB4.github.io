'use client';
import Markdown from 'react-markdown';

const comingsoonmessage: string = "Friend, I've moved to Austin, Texas, and am putting together several updates for this domain. Stay tuned.";

const copy: string = "A programmer and 3D artist based in Austin, Texas with a penchant for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  ";

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
                                {comingsoonmessage.toUpperCase()}
                            </Markdown>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}