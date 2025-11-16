'use client';
import React, { useState, useEffect } from 'react';
import jsondata from '../public/quotes.json';

const quotedata: QuoteData[] = jsondata.quotes;

export interface QuoteData {
  author: string;
  content: string;
}

interface ActiveQuoteInterface extends QuoteData {
  i: number;
}

const QuoteViewer: React.FC = () => {
  const [quotes] = useState<QuoteData[]>(quotedata);
  const [index, setIndex] = useState<number>(0);
  const [activeQuote, setActiveQuote] = useState<ActiveQuoteInterface>({
    i: -1,
    author: '',
    content: ''
  });
  const [order, setOrder] = useState<number[]>([]);

  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    const shuffled = shuffleArray([...Array(quotes.length).keys()]);
    setOrder(shuffled);
    
    const firstQuote: ActiveQuoteInterface = {
      i: shuffled[0],
      author: quotes[shuffled[0]].author,
      content: quotes[shuffled[0]].content,
    };
    setActiveQuote(firstQuote);
    setIndex(0);
  }, [quotes]);

  const handleInquiry = () => {
    let nextIndex = index + 1;
    if (nextIndex >= order.length) {
      const newOrder = shuffleArray([...Array(quotes.length).keys()]);
      setOrder(newOrder);
      nextIndex = 0;
      
      const nextQuote: ActiveQuoteInterface = {
        i: newOrder[0],
        author: quotes[newOrder[0]].author,
        content: quotes[newOrder[0]].content,
      };
      setIndex(0);
      setActiveQuote(nextQuote);
    } else {
      const pick = order[nextIndex];
      const nextQuote: ActiveQuoteInterface = {
        i: pick,
        author: quotes[pick].author,
        content: quotes[pick].content,
      };
      setIndex(nextIndex);
      setActiveQuote(nextQuote);
    }
  };

  return (
    <div className="weblog-quotes">
      <button className="quote-refresh" onClick={handleInquiry}>
        REFRESH
      </button>
      <div className="quote-container">
        <div className="quote-content">
          <h3>&quot;{activeQuote.content.toUpperCase()}&quot;</h3>
        </div>
        <div className="quote-author">
          <h4>{activeQuote.author}</h4>
        </div>
      </div>
    </div>
  );
};

export default QuoteViewer;