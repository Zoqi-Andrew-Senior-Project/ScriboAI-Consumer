import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import './pageeditor.css'
import debounce from "lodash.debounce";
import { useNavigate, useParams } from "react-router-dom";
import Progressbar from "@/components/Progressbar";
import Tooltip from "@/components/Tooltip";
import { HiArrowLeft, HiArrowRight, HiArrowsPointingIn, HiArrowsPointingOut, HiHome, HiBookOpen, HiClock, HiListBullet, HiFlag } from "react-icons/hi2";
import confetti from "canvas-confetti";
import { fetchCourseDetails, Course } from "@/api/course";
import MiniOutlineView from "./MiniOutlineView";
import { HiMenu, HiX } from "react-icons/hi";

interface WebSocketAction {
  next: () => void;
  prev: () => void;
  save: () => void;
  (action: any): void;
}

const useWebSocketAction = (ws: React.RefObject<WebSocket | null>) => {
  const sendAction = useCallback(
    debounce((action) => {
      console.log(`WebSocket Request: ${action}`);
      const data = { action };
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(data));
      }
    }, 500), // 500ms debounce
    [ws]
  );

  const webSocketAction = sendAction as unknown as WebSocketAction;

  // Attach predefined methods dynamically
  webSocketAction.next = () => sendAction("next");
  webSocketAction.prev = () => sendAction("back");

  return webSocketAction;
};

interface MetaData{
  prevPage: string,
  nextPage: string,
  currentPage: string,
  course: string,
  total: number,
  current_order: number
}

const PageViewer: React.FC = () => {
    const navigate = useNavigate();
    const { docId } = useParams();
    const [content, setContent] = useState<string>("No data.");  // Local state for smooth typing
    const [metaData, setMetaData] = useState<MetaData | null>(null)
    const ws = useRef<WebSocket | null>(null);
    const debouncedAction = useWebSocketAction(ws);
    const ref = useRef<any>(null); 
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const markdownRef = useRef<HTMLDivElement>(null);
    const [hasCompleted, setHasCompleted] = useState(false);
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [showCelebratoryButton, setShowCelebratoryButton] = useState(false);
    const prevProgress = useRef(0);
    const [completionButtonStyle, setCompletionButtonStyle] = useState<'celebratory' | 'compact'>('celebratory');
    const [hasFiredConfetti, setHasFiredConfetti] = useState(false);
    const [courseDetails, setCourseDetails] = useState<Course | null> (null);
    const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
    const [isMiniOutlineVisible, setIsMiniOutlineVisible] = useState(false); // New state for mini outline view visibility

    useEffect(() => {
      const loadCourseDetails = async () => {
        if (docId) {
          try {
            console.log(docId)
            const data = await fetchCourseDetails(docId);
            setCourseDetails(data);
          } catch (error) {
            console.error('Failed to load course details:', error);
          }
        }
      };
    
      loadCourseDetails();
    }, [docId]);

    const fireConfetti = () => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
      });
    };

    const toggleMiniOutlineView = () => {
      setIsMiniOutlineVisible((prevState) => !prevState);
    };

    // Scroll handler
    const handleScroll = useCallback(() => {
      if (markdownRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = markdownRef.current;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(Math.round(scrollPercentage));
      }
    }, []);

    // Add scroll event listener
    useEffect(() => {
      const currentRef = markdownRef.current;
      if (currentRef) {
        currentRef.addEventListener('scroll', handleScroll);
        return () => currentRef.removeEventListener('scroll', handleScroll);
      }
    }, [handleScroll]);

    // Calculate combined progress
    const calculateCombinedProgress = useCallback(() => {
      if (!metaData) return 0;
      
      // Page progress (0-100 based on current order)
      const pageProgress = ((metaData.current_order - 1) / metaData.total) * 100;
      
      // Scroll progress (0-100 within current page)
      const scrollContribution = scrollProgress / metaData.total;
      
      // Combined progress
      return pageProgress + scrollContribution;
    }, [metaData, scrollProgress]);

    // Track completion
    useEffect(() => {
      const currentProgress = calculateCombinedProgress();
      
      if (currentProgress >= 100 && prevProgress.current < 100) {
        setHasCompleted(true);
        setShowCelebratoryButton(true);
      }
      
      prevProgress.current = currentProgress;
    }, [calculateCombinedProgress]);

    // Fire confetti when course is completed
    useEffect(() => {
      if (hasCompleted && !hasFiredConfetti) {
        fireConfetti();
        setHasFiredConfetti(true);
      }
    }, [hasCompleted]);

    // Completion button handler
    const handleCompletionClick = () => {
      setShowCompletionDialog(true);
    };

    // Dialog actions
    const handleContinueReading = () => {
      setCompletionButtonStyle('compact');
      setShowCelebratoryButton(false); // Hide the initial celebratory button
      setShowCompletionDialog(false);
    };

    const handleGoHome = () => {
      // Navigate to home or wherever appropriate
      navigate("/home")
    };
      
    const toggleFullscreen = () => {
      const doc = document as Document;
      const docEl = document.documentElement;
    
      if (!document.fullscreenElement) {
        docEl.requestFullscreen?.().catch((err) =>
          console.error("Failed to enter fullscreen:", err)
        );
        setIsFullscreen(true);
      } else {
        doc.exitFullscreen?.().catch((err) =>
          console.error("Failed to exit fullscreen:", err)
        );
        setIsFullscreen(false);
      }
    };

    useEffect(() => {
      if (markdownRef.current) {
        markdownRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, [metaData?.current_order]); // Trigger when page changes
    
    useEffect(() => {
        setWsStatus('connecting');

        if (ws.current) {
            ws.current.close(); // Close previous connection before reconnecting
        }
        ws.current = new WebSocket(`${import.meta.env.VITE_WS_BACKEND}/document/${docId}/`);

        ws.current.onopen = () => {
          console.log("WebSocket Connected");
          setWsStatus('connected');
        };

        ws.current.onmessage = (event) => {
            try {
            const data = JSON.parse(event.data);

            setContent(data.data.content);
            ref.current?.setMarkdown(data.data.content);
            setMetaData(data.meta);
            } catch (error) {
            console.error("Error parsing WebSocket message:", error);
            }
        };

        ws.current.onerror = (error) =>  {
          console.error("WebSocket Error:", error);
          setWsStatus('disconnected');
        };
        ws.current.onclose = () => {
          console.log("WebSocket Disconnected");
          setWsStatus('disconnected');
        };

        return () => ws.current?.close();
    }, [docId]);
    
      // Debounced function to send updates with batching
    const sendUpdate = useCallback(
    debounce((newContent) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
        console.log({ content: newContent })
        const message = {
            "data": {
            content: newContent
            }
        }
        ws.current.send(JSON.stringify(message));
        }
    }, 500), // Delay WebSocket updates by 500ms
    []
    );

    interface ProgressBarProps {
      progress: number;
    }
  
    const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
      // Ensure progress is a number between 0 and 100
      const safeProgress = Math.round(Math.min(Math.max(progress, 0), 100));
    
      return (
        <div className="w-full bg-gray-300 rounded-lg h-6 overflow-hidden relative">
    
          {/* Top bar (progress) */}
          <div
            className="bg-blue-500 h-full transition-all relative"
            style={{ width: `${safeProgress}%` }}
            role="progressbar"
            aria-valuenow={safeProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
              {safeProgress}%
            </div>
          </div>
          {/* Bottom bar (background) */}
          <div className="w-full bg-gray-400 h-full rounded-lg min-w-[20em] " />
        </div>
      );
    };
  
    return (
      <div className="container mx-auto p-6">
        {/* Hamburger Menu to Toggle Mini Outline View */}
        <div className="fixed bottom-10 left-6 z-50">
          <Tooltip label="View Course Details">
            <button
              onClick={toggleMiniOutlineView}
              className="bg-gray-800 text-white p-3 rounded-full hover:bg-gray-700 focus:outline-none"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          </Tooltip>
        </div>

        {/* Mini Outline Card */}
        {isMiniOutlineVisible && (
          <div className="fixed bottom-4 left-4 z-50 shadow-lg rounded-lg w-72 overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={toggleMiniOutlineView}
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <HiX className="w-6 h-6" />
            </button>

            <MiniOutlineView corId={docId} />  {/* Pass course ID to MiniOutlineView */}
          </div>
        )}
        {/* Initial Celebratory Button (only shows once) */}
        {showCelebratoryButton && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <button
              onClick={handleCompletionClick}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              🎉 Course Completed! 🎉
            </button>
          </div>
        )}

        {/* Persistent Compact Completion Button (shows after Continue Reading) */}
        {hasCompleted && !showCelebratoryButton && (
          <div className="fixed bottom-24 right-4 z-50">
            <Tooltip label="Course Completed">
              <button
                onClick={handleCompletionClick}
                className="bg-green-500 hover:bg-green-600 text-white p-3 w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none flex items-center justify-center"
              >
                <span className="text-xl">🎉</span>
              </button>
            </Tooltip>
          </div>
        )}

        {/* Completion Button - changes style based on state */}
        {hasCompleted && (
          <>
            {completionButtonStyle === 'celebratory' ? (
              <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
                <button
                  onClick={handleCompletionClick}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-105"
                >
                  🎉 Course Completed! 🎉
                </button>
              </div>
            ) : (
              <div className="fixed bottom-24 right-4 z-50">
                <Tooltip label="Course Completed">
                  <button
                    onClick={handleCompletionClick}
                    className="bg-green-500 hover:bg-green-600 text-white p-3 w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none flex items-center justify-center"
                  >
                    <span className="text-xl">🎉</span>
                  </button>
                </Tooltip>
              </div>
            )}
          </>
        )}

        {/* Completion Dialog */}
        {showCompletionDialog && (
          <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">Congratulations!</h2>
              <p className="text-gray-700 mb-6">
                You've successfully completed the entire course material. What would you like to do next?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleContinueReading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Continue Reading</span>
                  <HiBookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
                </button>
                <button
                  onClick={handleGoHome}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Go Home</span>
                  <HiHome className="w-5 h-5 transition-transform group-hover:scale-110" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Navigation */}
        <div 
          className="fixed bottom-0 left-0 right-0 py-4 z-40 group w-auto"
        >      
          <div className="flex items-center justify-center gap-8 mx-auto w-2/3 bg-gray-50/75 pl-5 pr-5 rounded-full">
            {/* Left Arrow */}
            <Tooltip label={metaData?.current_order === 1 ? "You're on the first page" : "Go to previous page"}>
              <button
                onClick={debouncedAction.prev}
                disabled={metaData?.current_order === 1}
                className={`text-black p-2 rounded-md transition-all ${
                  metaData?.current_order === 1 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-600 hover:text-white'
                }`}
              >
                <HiArrowLeft className="w-8 h-6" strokeWidth={3} />
              </button>
            </Tooltip>

            {/* Progress Bar */}
            <div 
              className="flex-1 bg-gray-300 rounded-lg h-6 overflow-hidden transition-all duration-300"
              style={{ pointerEvents: 'none' }}
            >
              <Progressbar progress={calculateCombinedProgress()} />
            </div>

            {/* Right Arrow */}
            <Tooltip label={
              metaData?.current_order === metaData?.total 
                ? "You're on the last page" 
                : scrollProgress < 100
                  ? "Finish reading this page to continue"
                  : "Go to next page"
            }>
              <button
                onClick={debouncedAction.next}
                disabled={metaData?.current_order === metaData?.total || scrollProgress < 100}
                className={`text-black p-2 rounded-md transition-all ${
                  metaData?.current_order === metaData?.total || scrollProgress < 100
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-gray-600 hover:text-white'
                }`}
              >
                <HiArrowRight className="w-8 h-6" strokeWidth={3} />
              </button>
            </Tooltip>
          </div>
          {/* Save Status Indicator */}
          {/* <div className="text-sm text-gray-600 text-right mt-2">
            {savingStatus === 'saving' && <span className="text-yellow-500">Saving...</span>}
            {savingStatus === 'saved' && <span className="text-green-500">{getLastSavedText()}</span>}
            {savingStatus === 'idle' && <span className="text-gray-500">No changes</span>}
          </div> */}
        </div>

        {/* Page View */}
        <div
          ref={markdownRef}
          className={
            `${
              isFullscreen
              ? 'fixed top-0 left-0 w-screen h-screen p-15 overflow-auto bg-white prose max-w-none transition-all duration-1000 ease-in-out transform scale-100 opacity-100'
              : 'prose bg-white rounded-[30px] p-10 mx-auto max-w-7xl overflow-auto w-full h-screen transition-all duration-1000 ease-in-out transform scale-95 opacity-100'
            }`
          }
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {/* Full Screen */}
        <div className="fixed bottom-20 right-4 z-75">
          <Tooltip label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
            <button
              onClick={toggleFullscreen}
              className="bg-gray-800/90 hover:bg-gray-700 text-white p-3 w-14 h-14 rounded-full shadow-lg 
                        transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {isFullscreen ? (
                <HiArrowsPointingIn className="w-full h-full" />
              ) : (
                <HiArrowsPointingOut className="w-full h-full" />
              )}
            </button>
          </Tooltip>
        </div>

        
        <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50 bg-white/90 rounded-md p-1">
          <span
            className={`h-3 w-3 rounded-full ${
              wsStatus === 'connected'
                ? 'bg-green-500'
                : wsStatus === 'connecting'
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-red-500'
            }`}
          ></span>
          <span className="text-sm text-gray-700 bg-whi">
            {wsStatus === 'connected'
              ? 'Connected'
              : wsStatus === 'connecting'
              ? 'Connecting...'
              : 'Offline'}
          </span>
        </div>
      </div>
    );
  };
  
  export default PageViewer;