
import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';
const Weblog = () => {
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
    <div className="weblog-container weblog-index">
        <div className="weblog-selection">
            <div className={"entry-list"}>
                {entries.map((entry, index) => (
                    <Link
                        href={`/writing/${entry.slug}`}
                        key={entry.title}
                    >
                        <div className={"entry-card"}>
                            <div className={"entry-info"}>
                                <div className={"entry-id"}>
                                    <h4>{entry.date.replaceAll('-', '.')}</h4>
                                </div>
                                
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

            </div>
        </div>
      </div>
    </div>
    </>
    );
};

export default Weblog;

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