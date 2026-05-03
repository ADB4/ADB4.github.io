'use client';

import { useTheme } from "next-themes";
import { useState } from "react";
import Markdown from 'react-markdown';
import QuoteViewer from "./quoteviewer";
import { HomeContent } from "@/app/page";


const about2: string = "His vices oscillate between game developmen"
const copy: string = "_The nineteen-hour drive from Michigan in which I packed my 2009 Nissan Murano to the brim was nothing short of deiform. U.S. Route 69 through Oklahoma was idyllic, despite the perturbing lore of death and disappearances involving the long-haul trucking community._"
export interface HomeProps {
    content: HomeContent;
}
export default function HomeComponent({content}: HomeProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const { theme, setTheme } = useTheme();

    const markdownStyle: React.CSSProperties = {
        color: 'var(--text-primary)',
    };
    return (
        <>
            <div className="home-container">
                <div className="home-content ">
                    <div style={{
                        width: "100%",
                        height: "calc(100% - 8rem)",
                        margin: "auto 0 0 0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        backgroundColor: "var(--debug-1)",
                    }}>
                        <div className={"about-content"}>
                            <h5>0</h5>
                            <Markdown className={"markdown-sans about"}>
                                {content.bio}
                            </Markdown>
                        </div>
                        <div className={"writing-sample"}>
                            <h5>1</h5>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                height: "100%",
                                backgroundColor: "var(--debug-4)",
                            }}>
                                <Markdown className={"markdown-sans sample"}>
                                    {copy}
                                </Markdown>
                                <button
                                    aria-label={"read this article"}
                                    style={{
                                    cursor: "pointer",
                                    width: "fit-content",
                                    fontFamily: "Swiss721",
                                    fontSize: "1.125rem",
                                    fontWeight: "300",
                                    letterSpacing: "-0.02rem",
                                    background: "none",
                                    border: "none",
                                    margin: "0 0 0 auto",
                                }}>READ MORE</button>
                            </div>

                        </div>
                    </div>
                    <div style={{
                        maxWidth: "26rem",
                        width: "100%",
                        height: "calc(100% - 8rem)",
                        margin: "auto 0 0 0",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        backgroundColor: "var(--debug-4)",
                    }}>
                        <div className={"fun-content"}>
                            <h5>2</h5>
                            <div className={"fun-content-inner"}>
                                <Markdown className={"markdown-sans fun"}>
                                    {content.fun}
                                </Markdown>
                            </div>
                        </div>
                        <div className={"quote-content"}>
                            <h5>3</h5>
                            <QuoteViewer />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/*
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
 */