
import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';
import QuoteViewer from '../../components/quoteviewer';
export default function Weblog() {
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
    <div className="weblog-container">
      <div className="weblog-content">
        <div className="weblog-selection">
          <div className="entry-list" style={{
              paddingTop: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {entries.map((entry, index) => (
                  <Link
                      href={`/weblog/${entry.slug}`}
                      key={entry.title}
                  >
                    <div className={"entry-card"}>
                        <div className={"entry-header"}>
                            <h3>{parseTitle(entry.title)}</h3>
                        </div>
                        <div className={"entry-info"}>
                            <h4>{entry.category.toUpperCase()}</h4>
                            <h4>{entry.date.replaceAll('-', ' ')}</h4>
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
      </div>
    </div>
    </>
    );
}

/*
              <article 
                key={entry.slug}
                className="entry-card"
              >
                <div className="entry-card-header">
                  <h2>
                      {entry.title}
                  </h2>
                  <div className="entry-card-info">
                    <h3>
                      {entry.date.replaceAll('-', ' ')}
                    </h3>
                    <p>
                      {entry.category.toUpperCase()}
                    </p>
                    <time className="sr-only">
                      {entry.date}
                    </time>
                  </div>
                </div>
              </article>
*/