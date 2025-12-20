import React, { useRef, useEffect, useState } from 'react';

interface DisplayProps {
    widthRem?: number;
    heightRem?: number;
    pixelSize?: number;
    onColor?: string;
    offColor?: string;
}

interface Point3D {
    x: number;
    y: number;
    z: number;
}

interface Point2D {
    x: number;
    y: number;
}

const DisplayComponent: React.FC<DisplayProps> = ({
                                                       widthRem = 32,
                                                       heightRem = 16,
                                                       pixelSize = 4,
                                                       onColor = '#00ff00',
                                                       offColor = '#001100'
                                                   }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const rotationRef = useRef({ x: 0, y: 0, z: 0 });

    const remToPx = (rem: number): number => {
        if (typeof window !== 'undefined') {
            return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
        }
        return rem * 16; // Fallback
    };

    const width = Math.floor(remToPx(widthRem) / pixelSize);
    const height = Math.floor(remToPx(heightRem) / pixelSize);

    const sphereRadius = Math.min(width, height) * 0.4;

    const generateSphere = (): [Point3D, Point3D][] => {
        const lines: [Point3D, Point3D][] = [];
        const latitudes = 6;  // num horizontal rings
        const longitudes = 8; // num of vertical rings

        for (let lat = 0; lat < latitudes; lat++) {
            const theta1 = (lat * Math.PI) / latitudes;
            const theta2 = ((lat + 1) * Math.PI) / latitudes;

            for (let lon = 0; lon < longitudes; lon++) {
                const phi1 = (lon * 2 * Math.PI) / longitudes;
                const phi2 = ((lon + 1) * 2 * Math.PI) / longitudes;

                // Latitude segments
                const p1: Point3D = {
                    x: sphereRadius * Math.sin(theta1) * Math.cos(phi1),
                    y: sphereRadius * Math.cos(theta1),
                    z: sphereRadius * Math.sin(theta1) * Math.sin(phi1)
                };
                const p2: Point3D = {
                    x: sphereRadius * Math.sin(theta1) * Math.cos(phi2),
                    y: sphereRadius * Math.cos(theta1),
                    z: sphereRadius * Math.sin(theta1) * Math.sin(phi2)
                };
                lines.push([p1, p2]);
            }
        }
        for (let lon = 0; lon < longitudes; lon++) {
            const phi = (lon * 2 * Math.PI) / longitudes;

            for (let lat = 0; lat < latitudes; lat++) {
                const theta1 = (lat * Math.PI) / latitudes;
                const theta2 = ((lat + 1) * Math.PI) / latitudes;

                const p1: Point3D = {
                    x: sphereRadius * Math.sin(theta1) * Math.cos(phi),
                    y: sphereRadius * Math.cos(theta1),
                    z: sphereRadius * Math.sin(theta1) * Math.sin(phi)
                };
                const p2: Point3D = {
                    x: sphereRadius * Math.sin(theta2) * Math.cos(phi),
                    y: sphereRadius * Math.cos(theta2),
                    z: sphereRadius * Math.sin(theta2) * Math.sin(phi)
                };
                lines.push([p1, p2]);
            }
        }

        return lines;
    };

    const sphere = generateSphere();

    const rotateX = (point: Point3D, angle: number): Point3D => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x,
            y: point.y * cos - point.z * sin,
            z: point.y * sin + point.z * cos
        };
    };

    const rotateY = (point: Point3D, angle: number): Point3D => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x * cos + point.z * sin,
            y: point.y,
            z: -point.x * sin + point.z * cos
        };
    };

    const rotateZ = (point: Point3D, angle: number): Point3D => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: point.x * cos - point.y * sin,
            y: point.x * sin + point.y * cos,
            z: point.z
        };
    };


    const project = (point: Point3D): Point2D => {
        const distance = sphereRadius * 3; // Camera distance
        const scale = distance / (distance + point.z);
        return {
            x: Math.round(width / 2 + point.x * scale),
            y: Math.round(height / 2 + point.y * scale)
        };
    };

    // Bresenham's line algorithm
    const drawLine = (
        buffer: Uint8Array,
        x0: number,
        y0: number,
        x1: number,
        y1: number
    ) => {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (true) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                buffer[y * width + x] = 1;
            }

            if (x === x1 && y === y1) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const animate = () => {
            const buffer = new Uint8Array(width * height);

            rotationRef.current.y += 0.015;
            rotationRef.current.x += 0.01;
            rotationRef.current.z += 0.005;

            sphere.forEach(([start, end]) => {
                let p1 = rotateX(start, rotationRef.current.x);
                p1 = rotateY(p1, rotationRef.current.y);
                p1 = rotateZ(p1, rotationRef.current.z);

                let p2 = rotateX(end, rotationRef.current.x);
                p2 = rotateY(p2, rotationRef.current.y);
                p2 = rotateZ(p2, rotationRef.current.z);

                const proj1 = project(p1);
                const proj2 = project(p2);

                drawLine(buffer, proj1.x, proj1.y, proj2.x, proj2.y);
            });

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const pixel = buffer[y * width + x];
                    ctx.fillStyle = pixel ? onColor : offColor;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [width, height, pixelSize, onColor, offColor]);

    return (
        <div style={{
            margin: 'auto',
            marginRight: '0rem',
            display: 'flex',
            width: '3rem',
            height: '3rem',
        }}>
            <canvas
                ref={canvasRef}
                width={width * pixelSize}
                height={height * pixelSize}
                style={{ imageRendering: 'pixelated' }}
            />
        </div>

    );
};

export default DisplayComponent;