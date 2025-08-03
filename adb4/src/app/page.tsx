import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>Andy Bui</h1>
        <p>Programmer</p>
      </section>

      <section className={styles.about}>
        <h2>About Me</h2>
        <p>
        ###### &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Andy Bui* is the programmer and 3D artist behind *Roger Motorsports Library: A repository of polygon-optimized 3D assets, created with ReactJS and Flask.* He has a keen eye for designing functional, responsive interfaces, for which he cut his teeth in the olden days of MyBB forums. He is a Michigan native and an alumnus of the University of Michigan.  
        </p>
      </section>


      <section className={styles.contact}>
        <h2>Get In Touch</h2>
        <div className={styles.links}>
          <a href="mailto:buiand.pm.me">Email</a>
          <a href="https://github.com/ADB4" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </section>
    </main>
  )
}