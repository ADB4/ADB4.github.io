'use client';

import { useId, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';

/*
EntryDrawer

The writing page's entry list. On wide screens it sits beside the article
as before and the toggle stays hidden. On narrow screens (see the
"Weblog, narrow screens" block in globals.css) the list collapses behind
the toggle and opens over the article, so the article keeps the full
width and height.
*/

const EntryDrawer = ({ children }: { children: ReactNode }) => {
    const [open, setOpen] = useState(false);
    const drawerId = useId();

    // Close once an entry is picked, including the one already showing.
    const onClick = (e: MouseEvent) => {
        if ((e.target as Element).closest('a')) setOpen(false);
    };

    return (
        <div className={open ? 'weblog-selection open' : 'weblog-selection'}>
            <button
                type="button"
                className="weblog-toggle"
                aria-expanded={open}
                aria-controls={drawerId}
                onClick={() => setOpen(!open)}
            >
                <span>ENTRIES</span>
                <span>{open ? 'CLOSE' : 'OPEN'}</span>
            </button>
            <div className="weblog-drawer" id={drawerId} onClick={onClick}>
                {children}
            </div>
        </div>
    );
};

export default EntryDrawer;
