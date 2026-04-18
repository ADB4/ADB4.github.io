import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { getAllPosts, getPostBySlug } from '../../../lib/posts';
import ArticleComponent from "@/components/article";

export default async function WeblogPost({
                                             params
                                         }: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;
    const entries = getAllPosts();

    return (
        <>
            <ArticleComponent slug={"article0"}></ArticleComponent>
        </>
    );
}
