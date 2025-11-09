'use client';
import React, { useState, useLayoutEffect, useEffect, useMemo, useCallback } from 'react';

import jsondata from '../public/quotes.json';

const quotedata: QuoteData[] = jsondata.quotes;
export interface QuoteData {
  author: string;
  content: string;
}
interface ActiveQuoteInterface extends QuoteData{
    i: number;
}
const QuoteViewer: React.FC = () => {
    const [quotes, setQuotes] = useState<QuoteData[]>(quotedata);
    const [index, setIndex] = useState<number>(0);
    const [activeQuote, setActiveQuote] = useState<ActiveQuoteInterface>({
        i: -1,
        author: '',
        content: ''
    })
    const [order, setOrder] = useState<number[]>([...Array(quotes).keys()]);

    useEffect(() => {
        const shuffled = [...quotes.keys()];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setOrder(shuffled);
        const firstQuote: ActiveQuoteInterface = {
            i: shuffled[0],
            author: quotes[shuffled[0]].author,
            content: quotes[shuffled[0]].content,
        };
        setActiveQuote(firstQuote);
    },[]);

    function handleInquiry() {
       let k = index + 1;
       if (k >= order.length) {
           k = 0;
       }
       const pick = order[k];
       const nextquote = quotes[pick];
       const setquote: ActiveQuoteInterface = {
           i: pick,
           'content': nextquote.content,
           'author': nextquote.author,
       };
       console.log(setquote);
       setIndex(pick)
       setActiveQuote(setquote);
    }

    return (
        <div className="weblog-quotes">
            <button className="quote-refresh" onClick={() => {handleInquiry()}}>
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
    )
}

export default QuoteViewer;