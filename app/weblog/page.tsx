
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
                          <svg
                              viewBox="0 0 1000 100"
                              xmlns="http://www.w3.org/2000/svg"
                              preserveAspectRatio="none"
                          >
                              <defs>
                                  <mask id={`mask-${index}`}>
                                      <rect width="1000" height="100" fill="white"/>
                                      <text x="20" y="50" className="entry-header1">{entry.title}</text>
                                      <text x="980" y="40" className="entry-header2" textAnchor="end">
                                          {entry.date.replaceAll('-', ' ')}
                                      </text>
                                      <text x="980" y="65" className="entry-paragraph" textAnchor="end">
                                          {entry.category.toUpperCase()}
                                      </text>
                                  </mask>
                              </defs>
                              <rect
                                  width="1000"
                                  height="100"
                                  fill="var(--text-primary)"
                                  mask={`url(#mask-${index})`}
                                  rx="12"
                              />
                          </svg>

                          {/* HTML text overlay - only visible when not hovering */}
                          <div className="entry-text-overlay">
                              <div className="entry-text-left">
                                  <span className="entry-title">{entry.title}</span>
                              </div>
                              <div className="entry-text-right">
                                  <span className="entry-date">{entry.date.replaceAll('-', ' ')}</span>
                                  <span className="entry-category">{entry.category.toUpperCase()}</span>
                              </div>
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