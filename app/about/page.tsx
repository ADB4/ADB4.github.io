'use client';
import Markdown from 'react-markdown';
import { TypewriterComponent } from "../../components/typewriter";
export default function AboutPage() {
    const aboutCopy: string = "A programmer and 3D artist based in Austin, Texas with a penchant for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  "
    return (
        <div className="about-container">
            <TypewriterComponent text={aboutCopy}/>
        </div>
    );
}