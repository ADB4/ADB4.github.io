import styles from "./page.module.css";
import WeblogComponent from "./weblog/page";
import {Suspense} from "react";

import Markdown from 'react-markdown';
import Link from 'next/link';

const copy: string = " **Satz Pulvinar&nbsp;** vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl *malesuada lacinia integer* nunc posuere. Ut hendrerit sociosqu.";

const copy2: string = "*Lorem ipsum* dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos. At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga.  \n &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  Et harum quidem reru[d]um facilis est e[r]t expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellend[a]us. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."

const copy2short: string = "**Lorem ipsum** dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere.";

export default function Home() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<>Loading...</>}>
        <div className="root-container">
          <div className="home-content">
            <Markdown className="markdown-hero">
                {copy}
            </Markdown>
            <Link className="selectedwriting-container" href="/">
              <h3>OFFICIIS INCEPTOS</h3>
              <div className="marquee">
                <Markdown className="marquee-content">
                  {copy2} 
                </Markdown>
                <Markdown aria-hidden="true" className="marquee-content">
                  {copy2}
                </Markdown>
              </div>
              <div className="transparent-gradient-top"/>
              <div className="transparent-gradient-bottom"/>
            </Link>
            <div className="home-featured">
              <h3>FRINGILLA</h3>
              <Markdown className="markdown-standard">
                  Temporibus autem quibusdam
              </Markdown>
            </div>
          </div>
          <nav className="nav-container">
            <Link href="/weblog"><h2>OMNIS</h2></Link>
            <Link href="/about"><h2>INCEPTOS</h2></Link>
          </nav>
        </div>
      </Suspense>
    </div>
  );
}
