'use client';

import { useTheme } from "next-themes";
import {useEffect, useState } from "react";
import Markdown from 'react-markdown';
import QuoteViewer from "./quoteviewer";
import { HomeContent } from "@/app/page";
import { TypewriterComponent } from "./typewriter";
import LifeOscillators from "./gameoflife/GameOfLife";
const typewritercopy: string = "\"The nineteen-hour drive from Michigan in which I packed my 2009 Nissan Murano to the brim was nothing short of deiform. U.S. Route 69 through Oklahoma was idyllic, despite the perturbing lore of death and disappearances involving the long-haul trucking community.\"";
const about2: string = "His vices oscillate between game developmen"
const copy: string = "_The nineteen-hour drive from Michigan in which I packed my 2009 Nissan Murano to the brim was nothing short of deiform. U.S. Route 69 through Oklahoma was idyllic, despite its underbelly of death and disappearances many believe involved the long-haul trucking community._"


export interface HomeProps {
    content: HomeContent;
}
export default function HomeComponent({content}: HomeProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rleList, setRleList] = useState<string[]>([]);
    const { theme, setTheme } = useTheme();

    const markdownStyle: React.CSSProperties = {
        color: 'var(--text-primary)',
    };

    useEffect(() => {
        Promise.all(
            ["/oscillators/56p27.rle"].map((u) =>   // ← leading slash
                fetch(u).then((r) => r.text()),
            ),
        ).then(setRleList);
    }, []);
    return (
        <>
            <div className="home-container">
                <div className={"home-row"}>
                    <div className={"home-section home-bio"}>
                        <h5>0</h5>
                        <Markdown className={"markdown-sans home-bio-text"}>
                            {content.bio}
                        </Markdown>
                    </div>
                    <div className={"home-section home-fun"}>
                        <h5>1</h5>
                        <div className={"home-fun-body"}>
                            <Markdown className={"markdown-sans home-fun-text"}>
                                {content.fun}
                            </Markdown>
                        </div>
                    </div>
                </div>
                <div className={"home-row"}>
                    <div className={"home-section home-monocoque"}>
                        <h5>2</h5>
                        <div className={"home-monocoque-body"}>
                            {/*<TypewriterComponent text={typewritercopy}/>*/}
                            <LifeOscillators rows={10} cols={10} scene={"figure-eight"}    aliveGradient={{
                                stops: ["var(--text-primary)", "#69ff00"],
                                maxAge: 4,
                                easing: "ease-out",
                            }}/>
                            <div className={"monocoque-logo"}>
                                <h3>MONOCOQUE</h3>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
}