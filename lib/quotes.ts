
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'quotes');
import data from '../public/quotes.json';

const quotes: QuoteData[] = data.quotes;
export interface QuoteData {
  author: string;
  content: string;
}
export function getAllQuotes(): QuoteData[] {
  const randomizedQuotes: QuoteData[] = [...quotes];

  for (let i = randomizedQuotes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedQuotes[i], randomizedQuotes[j]] = [randomizedQuotes[j], randomizedQuotes[i]];
  }
  
  return randomizedQuotes;
}
