import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const writingDirectory = path.join(process.cwd(), 'app/writing');

export interface PostData {
    slug: string;
    masthead: string;
    title: string;
    date: string;
    category: string;
    excerpt?: string;
    layout: 'scroll' | 'paged';
    content: string;
}

export function getAllPosts(): PostData[] {
    const entries = fs.readdirSync(writingDirectory, { withFileTypes: true });

    const allPostsData = entries
        .filter(entry => entry.isDirectory())
        .flatMap((entry): PostData[] => {
            const slug = entry.name;
            const postPath = path.join(writingDirectory, slug, 'post.md');

            if (!fs.existsSync(postPath)) return [];

            const fileContents = fs.readFileSync(postPath, 'utf8');
            const matterResult = matter(fileContents);

            return [{
                slug,
                masthead: matterResult.data.masthead || '',
                title: matterResult.data.title || slug,
                date: matterResult.data.date || '',
                category: matterResult.data.category || '',
                excerpt: matterResult.data.excerpt || '',
                layout: matterResult.data.layout === 'paged' ? 'paged' : 'scroll',
                content: matterResult.content,
            }];
        });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): PostData | null {
    try {
        const fullPath = path.join(writingDirectory, slug, 'post.md');
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);

        return {
            slug,
            masthead: matterResult.data.masthead || '',
            title: matterResult.data.title || slug,
            date: matterResult.data.date || '',
            category: matterResult.data.category || '',
            excerpt: matterResult.data.excerpt || '',
            layout: matterResult.data.layout === 'paged' ? 'paged' : 'scroll',
            content: matterResult.content,
        };
    } catch {
        return null;
    }
}