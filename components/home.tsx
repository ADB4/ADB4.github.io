'use client';

import { useTheme } from "next-themes";
import {useEffect, useState } from "react";
import Markdown from 'react-markdown';
import { HomeContent } from "@/app/page";
import LifeOscillators from "./gameoflife/GameOfLife";
const typewritercopy: string = "\"The nineteen-hour drive from Michigan in which I packed my 2009 Nissan Murano to the brim was nothing short of deiform. U.S. Route 69 through Oklahoma was idyllic, despite the perturbing lore of death and disappearances involving the long-haul trucking community.\"";
const about2: string = "His vices oscillate between game developmen"
const copy: string = "_The nineteen-hour drive from Michigan in which I packed my 2009 Nissan Murano to the brim was nothing short of deiform. U.S. Route 69 through Oklahoma was idyllic, despite its underbelly of death and disappearances many believe involved the long-haul trucking community._"


export interface HomeProps {
    content: HomeContent;
}
const HomeComponent = ({content}: HomeProps) => {
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
                        <LifeOscillators className={"oscillator-micro"} cellSize={6} rows={4} cols={4} colOffset={0} speed={1} scene={"toad"}    aliveGradient={{
                            stops: ["var(--text-primary)"],
                            maxAge: 4,
                            easing: "ease-out",
                        }}/>
                        <Markdown className={"markdown-sans home-bio-text"}>
                            {content.bio}
                        </Markdown>
                    </div>
                    <div className={"home-section home-fun"}>
                        <LifeOscillators className={"oscillator-micro"} cellSize={4} rowOffset={0} rows={8} cols={8} colOffset={0} speed={1} scene={"figure-eight"}    aliveGradient={{
                            stops: ["var(--text-primary)"],
                            maxAge: 4,
                            easing: "ease-out",
                        }}/>
                        <div className={"home-fun-body"}>
                            <Markdown className={"markdown-sans home-fun-text"}>
                                {content.fun}
                            </Markdown>
                        </div>
                    </div>
                </div>
                <div className={"home-row"}>
                    <div className={"home-section-container"}>
                        <div className={"flex-row"}>
                            <LifeOscillators className={"oscillator-micro"} cellSize={6} rows={4} cols={4} colOffset={0} speed={1} scene={"beacon"}    aliveGradient={{
                                stops: ["var(--text-primary)"],
                                maxAge: 4,
                                easing: "ease-out",
                            }}/>
                            <div className={"home-section-header"}>
                                <h4>RECENT MODELS</h4>
                            </div>
                        </div>
                        <div className={"home-models-container"}>
                            hello world!
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomeComponent;