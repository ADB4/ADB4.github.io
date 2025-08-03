// app/page.tsx
import Link from 'next/link'
import styles from './page.module.css'

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  githubUrl?: string
  liveUrl?: string
}


export default function HomePage() {
  const featuredProjects: Project[] = [
    {
      id: '1',
      title: 'Roger Motorsports Library',
      description: 'A web platform for 3D assets.',
      technologies: ['React','Three.js', 'TypeScript', 'Node.js', 'MongoDB'],
      githubUrl: 'https://github.com/yourusername/ecommerce-dashboard',
      liveUrl: 'https://rogerlibrary.com'
    },

  ]

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logo}>
            <Link href="/">Your Name</Link>
          </div>
          <ul className={styles.navLinks}>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/projects">Projects</Link></li>
            <li><Link href="/writing">Writing</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Hi, I'm <span className={styles.highlight}>Your Name</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Full Stack Developer passionate about creating beautiful, 
            functional web applications that solve real-world problems.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/projects" className={styles.primaryButton}>
              View My Work
            </Link>
            <Link href="/contact" className={styles.secondaryButton}>
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className={styles.about}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>About Me</h2>
          <p className={styles.aboutText}>
            ###### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Andy Bui* is the programmer and 3D artist behind *Roger Motorsports Library: A repository of polygon-optimized 3D assets, created with ReactJS and Flask.* He has a keen eye for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  
          </p>
          <Link href="/about" className={styles.textLink}>
            Learn more!
          </Link>
        </div>
      </section>


      {/* Featured Projects */}
      <section className={styles.projects}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Work</h2>
          <div className={styles.projectsGrid}>
            {featuredProjects.map((project) => (
              <div key={project.id} className={styles.projectCard}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.projectDescription}>{project.description}</p>
                <div className={styles.technologies}>
                  {project.technologies.map((tech) => (
                    <span key={tech} className={styles.techTag}>{tech}</span>
                  ))}
                </div>
                <div className={styles.projectLinks}>
                  {project.githubUrl && (
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.projectLink}
                    >
                      GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a 
                      href={project.liveUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.projectLink}
                    >
                      Check it out!
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.sectionFooter}>
            <Link href="/projects" className={styles.textLink}>
              View all projects →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>&copy; 2025 Andy Bui. All rights reserved.</p>
          <div className={styles.socialLinks}>
            <a href="https://github.com/ADB4" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}