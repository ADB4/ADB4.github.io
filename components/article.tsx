import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import * as React from "react"
import { usePathname } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react';
import { DeviceContext } from '../context/devicecontext';
import { useDevice } from '../hooks/useDevice';
import Link from "next/link";
import {getPostBySlug, PostData } from "@/lib/posts";

export interface ArticleProps {
    data: PostData;
}
const ArticleComponent: React.FC<{
    slug: string;
}> = ({ slug }) => {
    const article = getPostBySlug(slug);

    if (!article) {
        notFound();
    }
    return (
        <>
            <div className="weblog-container">
            <div className={"weblog-content"}>
                <div className={"selected-article-container"}>
                    <ReactMarkdown className={"markdown-article"}>
                        {article.content}
                    </ReactMarkdown>
                </div>
            </div>
            </div>
        </>
    )
}

export default ArticleComponent;