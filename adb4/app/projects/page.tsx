import Link from 'next/link';

export default function ProjPage() {
  return (
    <div className="weblog-container">
      <div className="weblog-content">
        <div className="weblog-selection">
          <div className="entry-list" style={{ 
              paddingTop: '1.0rem',
              display: 'flex', 
              flexDirection: 'column', 
            }}>
          </div>
        </div>
      </div>
    </div>
  );
}