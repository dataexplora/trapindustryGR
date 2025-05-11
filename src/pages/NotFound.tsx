import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import "../styles/NotFound.css";

// Register the SplitText plugin
gsap.registerPlugin(SplitText);

const NotFound = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    if (textRef.current && handleRef.current) {
      // Create split text instance
      const splitText = new SplitText(textRef.current, { type: "chars,words" });
      const chars = splitText.chars;

      // Create timelines
      const textTimeline = gsap.timeline();
      const handleTimeline = gsap.timeline();

      // Animate text characters
      textTimeline.from(chars, {
        duration: 0.001,
        opacity: 0,
        ease: "back.inOut(1.7)",
        stagger: 0.05,
        onComplete: () => {
          // Animate handle after text animation
          animateHandle();
        }
      });

      // Start blinking handle
      handleTimeline.fromTo(handleRef.current,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, repeat: -1, yoyo: true }
      );

      // Handle animation function
      const animateHandle = () => {
        if (textRef.current && handleRef.current) {
          const textWidth = textRef.current.offsetWidth;
          gsap.to(handleRef.current, {
            duration: 0.7,
            x: textWidth,
            ease: "steps(12)"
          });
        }
      };

      // Replay animation on click
      const replayButton = document.getElementById('cb-replay');
      if (replayButton) {
        replayButton.addEventListener('click', () => {
          textTimeline.restart();
          handleTimeline.restart();
        });
      }

      // Cleanup
      return () => {
        textTimeline.kill();
        handleTimeline.kill();
        if (replayButton) {
          replayButton.removeEventListener('click', () => {});
        }
        splitText.revert();
      };
    }
  }, []);

  return (
    <div className="not-found-container" ref={containerRef}>
      <div className="copy-container">
        <p ref={textRef}>
          404, page not found.
        </p>
        <span className="handle" ref={handleRef}></span>
      </div>

      <svg version="1.1" id="cb-replay" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 279.9 297.3" style={{background: "new 0 0 279.9 297.3"}} xmlSpace="preserve">
        <g>
          <path d="M269.4,162.6c-2.7,66.5-55.6,120.1-121.8,123.9c-77,4.4-141.3-60-136.8-136.9C14.7,81.7,71,27.8,140,27.8
            c1.8,0,3.5,0,5.3,0.1c0.3,0,0.5,0.2,0.5,0.5v15c0,1.5,1.6,2.4,2.9,1.7l35.9-20.7c1.3-0.7,1.3-2.6,0-3.3L148.6,0.3
            c-1.3-0.7-2.9,0.2-2.9,1.7v15c0,0.3-0.2,0.5-0.5,0.5c-1.7-0.1-3.5-0.1-5.2-0.1C63.3,17.3,1,78.9,0,155.4
            C-1,233.8,63.4,298.3,141.9,297.3c74.6-1,135.1-60.2,138-134.3c0.1-3-2.3-5.4-5.3-5.4l0,0C271.8,157.6,269.5,159.8,269.4,162.6z"/>
        </g>
      </svg>
    </div>
  );
};

export default NotFound;
