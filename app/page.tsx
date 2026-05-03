import { getAllPosts } from '../lib/posts';
import fs from 'fs'
import path from 'path'

import HomeComponent from '../components/home';

export interface HomeContent {
    bio: string;
    fun: string;
}
export default function HomePage() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 1);

  const content = {
      bio: fs.readFileSync(path.join(process.cwd(), 'content/bio.md'), 'utf8'),
      fun: fs.readFileSync(path.join(process.cwd(), 'content/fun.md'), 'utf8'),
  }

  return (
    <HomeComponent content={content}/>
  );
}
