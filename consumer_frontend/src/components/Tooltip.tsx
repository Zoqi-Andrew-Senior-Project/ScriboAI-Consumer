import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface MousePosition {
  x: number;
  y: number;
}

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ label, children }) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });
  const parentRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Measure tooltip size when it becomes visible
  useEffect(() => {
    if (isHovered && tooltipRef.current) {
      const { width, height } = tooltipRef.current.getBoundingClientRect();
      setTooltipSize({ width, height });
    }
  }, [isHovered, label]);

  const calculateTooltipPosition = (mouseX: number, mouseY: number) => {
    // Use actual measured dimensions
    const { width: tooltipWidth, height: tooltipHeight } = tooltipSize;

    // Default: 10px right and above cursor
    let left = mouseX + 10;
    let top = mouseY - tooltipHeight - 10;

    // Adjust if overflowing right
    if (left + tooltipWidth > window.innerWidth) {
      left = mouseX - tooltipWidth - 10;
    }

    // Adjust if overflowing left
    if (left < 0) {
      left = 10;
    }

    // Adjust if overflowing top
    if (top < 0) {
      top = mouseY + 10;
    }

    // Adjust if overflowing bottom
    if (top + tooltipHeight > window.innerHeight) {
      top = window.innerHeight - tooltipHeight - 10;
    }

    return { left, top };
  };

  return (
    <div
      ref={parentRef}
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered &&
        createPortal(
          <div
            ref={tooltipRef}
            className="fixed bg-gray-800 text-white text-xs font-medium py-1 px-2 rounded-md opacity-100 z-[9999] whitespace-nowrap"
            style={{
              // Initial positioning off-screen to measure
              left: isHovered ? `${calculateTooltipPosition(mousePosition.x, mousePosition.y).left}px` : '-9999px',
              top: isHovered ? `${calculateTooltipPosition(mousePosition.x, mousePosition.y).top}px` : '-9999px',
              pointerEvents: "none",
              // Ensure the tooltip is visible for measurement even when off-screen initially
              visibility: isHovered ? 'visible' : 'hidden',
            }}
          >
            {label}
          </div>,
          document.body
        )}
    </div>
  );
};

export default Tooltip;