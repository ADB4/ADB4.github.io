import React, { useState, useEffect } from 'react';

interface TerminalProps {
  text: string;
  speed?: number;
  delay?: number;
  pauseChance?: number;
  onComplete?: () => void;
}

const TerminalComponent: React.FC<TerminalProps> = ({
    text,
    speed = 100,
    delay = 1000,
    pauseChance = 0.2,
    onComplete
}) => {

    return (
        <span className="terminal">

        </span>
    )
}