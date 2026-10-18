import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '../../../lib/posts';
import ArticleComponent from '@/components/article';
import EntryDrawer from '@/components/entrydrawer';
import Markdown from "react-markdown";

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map(post => ({ slug: post.slug }));
}

const WeblogPost = async ({
    params,
}: {
    params: Promise<{ slug: string }>;
}) => {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) notFound();

    const entries = getAllPosts();

    const parseTitle = (title: string) => {
        const parts = title.split(/(\*[^*]+\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                return (
                    <span key={index} className="highlighted">
            {part.toUpperCase().slice(1, -1)}
          </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <>
            <div className="weblog-container">
                <EntryDrawer>
                    <div
                        className="entry-list"
                        style={{
                            paddingTop: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: '1.2rem',
                            backgroundColor: 'var(--debug-1)',
                        }}
                    >
                        {entries.map((entry, index) => (
                            <Link href={`/writing/${entry.slug}`} key={entry.title}>
                                <div className="entry-card">
                                    <div className="entry-info">
                                        <div className="entry-id">
                                            <h4>NO. {index}</h4>
                                        </div>
                                        <h4>{entry.category.toUpperCase()}</h4>
                                    </div>
                                    <div className="entry-title">
                                        <h3>"{parseTitle(entry.title.toUpperCase())}"</h3>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </EntryDrawer>
                <div className="weblog-content">
                    <div className="weblog-mat">
                        <div className={"entry-cover"}>
                            <div className={"cover-title"}>
                                <h2>{post.masthead}</h2>
                                <Markdown className={"markdown-cover"}>{post.title}</Markdown>
                            </div>
                        </div>
                        <div className={post.layout === 'paged' ? 'entry-content paged' : 'entry-content'}>
                            <ArticleComponent slug={slug} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WeblogPost;