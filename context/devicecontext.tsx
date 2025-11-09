'use client';

import { createContext, useLayoutEffect, useContext, useEffect, useState, ReactNode } from 'react';

// DeviceContext: for mobile/desktop viewports
export const DeviceContext = createContext< boolean | undefined>(undefined);
export const useDeviceContext = () => {
    const context = useContext(DeviceContext);
    if (context === undefined) {
        throw new Error('Device context not found.');
    }
    return context;
};