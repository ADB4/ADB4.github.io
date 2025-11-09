import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { getAllPosts, getPostBySlug } from '../../../lib/posts';

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Generate metadata for each post
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const post = getPostBySlug('test0');
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function WeblogPost({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const post = getPostBySlug('test0');
  const entries = getAllPosts();
  if (!post) {
    notFound();
  }

  return (
    <>
    <div className="weblog-container">
      <div className="weblog-content">
        <div className="weblog-selection">
          <h1>
            Weblog: {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
          </h1>
          <div className="entry-list" style={{ 
              paddingTop: '1.0rem',
              display: 'flex', 
              flexDirection: 'column', 
            }}>
            {entries.map((entry, index) => (
              <Link
                href={`/weblog/${entry.slug}`}
                key={entry.title}
              >
              <div className="entry-card">
                <svg viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <mask id={`mask-${index}`}>
                      <rect width="320" height="100" fill="white"/>
                      <text x="10" y="35" className="entry-header1">{entry.title}</text>
                      <text x="310" y="35" className="entry-header2" textAnchor="end">{entry.date.replaceAll('-', ' ')}</text>
                      <text x="310" y="55" className="entry-paragraph" textAnchor="end">{entry.category.toUpperCase()}</text>
                    </mask>
                  </defs>
                  <rect width="320" height="100" fill="var(--text-primary)" className="entry-card-rect" mask={`url(#mask-${index})`} rx="12"/>
                <g className="text-layer">
                    <text x="10" y="35" className="entry-header1">{entry.title}</text>
                    <text x="310" y="35" className="entry-header2" textAnchor="end">{entry.date.replaceAll('-', ' ')}</text>
                    <text x="310" y="55" className="entry-paragraph" textAnchor="end">{entry.category.toUpperCase()}</text>
                </g>
                </svg>
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
              <p>No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
          <div className="selected-article-container">
            <ReactMarkdown
              className="markdown-article"
              components={{
                h1: ({children}) => (
                  <h1 style={{ 
                    fontSize: '2rem', 
                    margin: '0rem 0 1rem 0', 
                    color: '#333',
                    lineHeight: '1.3'
                  }}>
                    {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    margin: '1rem 0 0 0', 
                    color: '#333',
                    lineHeight: '1.3'
                  }}>
                    {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    margin: '0rem 0 0rem 0', 
                    color: '#333' 
                  }}>
                    {children}
                  </h3>
                ),
                h4: ({children}) => (
                  <h4 style={{ 
                    fontSize: '1.5rem', 
                    margin: '0', 
                    color: '#333' 
                  }}>
                    {children}
                  </h4>
                ),
                p: ({children}) => (
                  <p style={{ 
                    margin: '0 0 0 0', 
                    lineHeight: '1.1' 
                  }}>
                    {children}
                  </p>
                ),
                ul: ({children}) => (
                  <ul style={{ 
                    margin: '0 0 1.5rem 0', 
                    paddingLeft: '2rem' 
                  }}>
                    {children}
                  </ul>
                ),
                ol: ({children}) => (
                  <ol style={{ 
                    margin: '0 0 1.5rem 0', 
                    paddingLeft: '2rem' 
                  }}>
                    {children}
                  </ol>
                ),
                li: ({children}) => (
                  <li style={{ 
                    margin: '0 0 0.5rem 0' 
                  }}>
                    {children}
                  </li>
                ),
                blockquote: ({children}) => (
                  <blockquote style={{ 
                    margin: '1.5rem 0',
                    padding: '1rem 2rem',
                    borderLeft: '4px solid #007acc',
                    backgroundColor: '#f8f9fa',
                    fontStyle: 'italic',
                    color: '#555'
                  }}>
                    {children}
                  </blockquote>
                ),
                code: ({children, className}) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code style={{ 
                        backgroundColor: '#f4f4f4',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '3px',
                        fontSize: '0.9em',
                        fontFamily: 'monospace'
                      }}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code style={{ 
                      display: 'block',
                      backgroundColor: '#f4f4f4',
                      padding: '1rem',
                      borderRadius: '5px',
                      fontSize: '0.9em',
                      fontFamily: 'monospace',
                      overflow: 'auto',
                      margin: '1.5rem 0'
                    }}>
                      {children}
                    </code>
                  );
                },
                a: ({children, href}) => (
                  <a 
                    href={href}
                    style={{ 
                      color: '#007acc', 
                      textDecoration: 'underline' 
                    }}
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
      </div>
    </div>
    </>
  );
}