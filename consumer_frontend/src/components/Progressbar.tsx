import React from "react";

interface ProgressBarProps {
    progress: number;
}

const Progressbar: React.FC<ProgressBarProps> = ({ progress }) => {
    // If progress is undefined or null, set it to 0, then ensure it's a number between 0 and 100
    const safeProgress = Math.round(Math.min(Math.max(progress ?? 0, 0), 100));

    return (
        <div className="w-full bg-gray-300 rounded-lg h-6 overflow-hidden relative border-2 border-black">
            {/* Top bar (progress) */}
            <div
                className="bg-blue-500 h-full transition-all duration-1000 ease-in-out relative"
                style={{ width: `${safeProgress}%` }}
                role="progressbar"
                aria-valuenow={safeProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            >
            </div>

            {/* Bottom bar (background) */}
            <div className="w-full bg-gray-400 h-full rounded-lg min-w-[20em]" />
        </div>
    );
};

export default Progressbar;