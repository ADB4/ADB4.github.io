import ReactMarkdown from 'react-markdown';
import { notFound } from 'next/navigation';
import {getPostBySlug, PostData } from "@/lib/posts";
import PagedArticle from './pagedarticle';

export interface ArticleProps {
    data: PostData;
}
const ArticleComponent = ({ slug }: { slug: string }) => {
    const article = getPostBySlug(slug);

    if (!article) {
        notFound();
    }
    const markdown = (
        <ReactMarkdown className={"markdown-article"}>
            {article.content}
        </ReactMarkdown>
    );
    return article.layout === 'paged' ? <PagedArticle>{markdown}</PagedArticle> : markdown;
};

export default ArticleComponent;