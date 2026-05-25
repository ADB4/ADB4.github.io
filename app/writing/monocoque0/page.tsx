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
    const parseTitle = (title: string) => {
        const parts = title.split(/(\*[^*]+\*)/g);

        return parts.map((part, index) => {
            if (part.startsWith('*') && part.endsWith('*')) {
                // Remove the asterisks and apply styling
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
            <>
                <div className="weblog-container">
                    <div className="weblog-selection">
                        <div className="entry-list" style={{
                            paddingTop: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            rowGap: '1.2rem',
                            backgroundColor: 'var(--debug-1)'
                        }}>
                            {entries.map((entry, index) => (
                                <Link
                                    href={`/writing/${entry.slug}`}
                                    key={entry.title}
                                >
                                    <div className={"entry-card"}>
                                        <div className={"entry-info"}>

                                            <div className={"entry-id"}>
                                                <h4>NO. {index}</h4>
                                            </div>
                                            <h4>{entry.category.toUpperCase()}</h4>
                                            {/*<h4>{entry.date.replaceAll('-', ' ')}</h4>*/}
                                        </div>
                                        <div className={"entry-title"}>
                                            <h3>"{parseTitle(entry.title.toUpperCase())}"</h3>

                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {entries.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '3rem 0',
                                color: '#666'
                            }}>
                                <p>No blog posts yet. Check back soon.</p>
                            </div>
                        )}
                    </div>
                    <div className="weblog-content">
                        <div className={"weblog-mat"}>
                            <div className={"entry-cover"}>
                                <div className={"cover-title"}>
                                    <h2>MONOCOQUE</h2>
                                    <h3>One Month with the 2018 Jaguar F-TYPE R</h3>
                                </div>
                            </div>
                            <div className={"entry-content"}>
                                <ArticleComponent slug={"monocoque0"}></ArticleComponent>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </>
    );
}
