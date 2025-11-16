
import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';
import QuoteViewer from '../../components/quoteviewer';
export default function Weblog() {
  const entries = getAllPosts();
  return (
    <>
    <div className="weblog-container">
      <div className="weblog-content">
        <div className="weblog-selection">
          <h1>
            WEBLOG: {entries.length} {entries.length === 1 ? 'ENTRY' : 'ENTRIES'}
          </h1>
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
              <p>No blog posts yet. Check back soon.</p>
            </div>
          )}
        </div>
          <QuoteViewer />
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