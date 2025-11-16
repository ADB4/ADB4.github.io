import { getAllPosts } from '../lib/posts';

import HomeComponent from '../components/home';

export default function HomePage() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 1);
  return (
    <HomeComponent />
  );
}
