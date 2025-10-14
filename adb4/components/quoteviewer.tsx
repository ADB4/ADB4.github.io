'use client';
import React, { useState, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';

import jsondata from '../public/quotes.json';

const quotedata: QuoteData[] = jsondata.quotes;
export interface QuoteData {
  author: string;
  content: string;
}
const QuoteViewer: React.FC = () => {
    const [quotes, setQuotes] = useState<QuoteData[]>(quotedata);
    const [activeQuote, setActiveQuote] = useState<number>(0);

    useEffect(() => {
        const shuffled = [...quotes];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setQuotes(shuffled);
    },[]);

    const handleRefreshQuote = () => {
        if (activeQuote == quotes.length - 1) {
            setActiveQuote(0);
        } else {
            setActiveQuote(activeQuote + 1);
        }
    };

    return (
        <div className="weblog-quotes">
            <button className="quote-refresh" onClick={() => {handleRefreshQuote()}}>
                REFRESH
            </button>
            <div className="quote-container">
                <div className="quote-content">
                    <h3>{quotes[activeQuote].content}</h3>
                </div>
                <div className="quote-author">
                    <h4>{quotes[activeQuote].author}</h4>
                </div>
            </div>
        </div>
    )
}

export default QuoteViewer;