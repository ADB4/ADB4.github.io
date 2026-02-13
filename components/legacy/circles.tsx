import React, { useState, useEffect, useMemo } from 'react';

interface Circle {
  x: number;
  y: number;
  radius: number;
}

interface CirclesProps {
  n?: number;
  m?: number;
  minRadius?: number;
  maxRadius?: number;
}

const CirclesComponent: React.FC<CirclesProps> = ({
  n = 4,
  m = 400,
  minRadius = 25,
  maxRadius = 25
}) => {
  const [circles, setCircles] = useState<Circle[]>([]);

  const generateCircles = useMemo(() => {
    return () => {
      const newCircles: Circle[] = [];
      const maxAttempts = 1000;
      const gridSize = Math.ceil(m / (maxRadius * 2));
      const grid: Circle[][][] = [];
      for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
          grid[i][j] = [];
        }
      }

      const getGridCell = (x: number, y: number) => {
        const col = Math.floor(x / (maxRadius * 2));
        const row = Math.floor(y / (maxRadius * 2));
        return { row: Math.max(0, Math.min(row, gridSize - 1)), 
                 col: Math.max(0, Math.min(col, gridSize - 1)) };
      };

      const checkCollision = (circle: Circle): boolean => {
        const { row, col } = getGridCell(circle.x, circle.y);
        
        for (let r = Math.max(0, row - 1); r <= Math.min(gridSize - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(gridSize - 1, col + 1); c++) {
            for (const existing of grid[r][c]) {
              const dx = circle.x - existing.x;
              const dy = circle.y - existing.y;
              const distSq = dx * dx + dy * dy;
              const minDist = circle.radius + existing.radius;
              
              if (distSq < minDist * minDist) {
                return true;
              }
            }
          }
        }
        return false;
      };

      const radiusRange = maxRadius - minRadius;
      
      for (let i = 0; i < n; i++) {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < maxAttempts) {
          const radius = minRadius + Math.random() * radiusRange;
          const x = radius + Math.random() * (m - 2 * radius);
          const y = radius + Math.random() * (m - 2 * radius);
          
          const newCircle: Circle = { x, y, radius };
          
          if (!checkCollision(newCircle)) {
            newCircles.push(newCircle);
            const { row, col } = getGridCell(x, y);
            grid[row][col].push(newCircle);
            placed = true;
          }
          
          attempts++;
        }
        
        if (!placed) break;
      }
      
      setCircles(newCircles);
    };
  }, [n, m, minRadius, maxRadius]);

  useEffect(() => {
    generateCircles();
  }, [generateCircles]);

  return (
      <div style={{ width: '16rem', height: '16rem', backgroundColor: 'transparent' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${m} ${m}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {circles.map((circle, i) => (
            <circle
              key={i}
              cx={circle.x}
              cy={circle.y}
              r={circle.radius}
              fill={`white`}
            />
          ))}
        </svg>
      </div>
  );
};

const GridComponent: React.FC<{
    height: number;
    width: number;
}> = ({height, width}) => {
    const [rows, setRows] = useState<number>(0);
    const [cols, setCols] = useState<number>(0);

    const calculateGrid = useMemo(() => {
        return () => {
            const numRows: number = Math.floor(height / 256);
            const numCols: number = Math.floor(width / 256);
            setRows(numRows);
            setCols(numCols);
        }
    }, [height, width]);

    useEffect(() => {
        calculateGrid();
    }, [calculateGrid])
    const GridStyle: React.CSSProperties = {
        height: 'calc(' + height.toString() + 'px - 2.0rem)',
        width: 'calc(' + width.toString() + 'px - 2.0rem)',
    }
    return (
        <div className="grid-component"
                style={GridStyle}
        >
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="grid-row">
                    {Array.from({ length: cols }, (_, j) => (
                        <CirclesComponent key={j}/>
                    ))}
                </div>
            ))}
        </div>
    )
}
export default GridComponent;