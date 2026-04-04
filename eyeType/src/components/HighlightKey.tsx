import { useEffect, useRef, useState } from "react";

type Props = {
  gazeData: { x: number; y: number } | null;
  onHighlight: (row: number, column: number) => void;
};

const classes = ["key", "top-bar-button", "sentence-container", "keyboard-section-overlay", "back-button", "spell-arrow-button"];

function findInteractiveParent(element: Element | null): HTMLElement | null {
  let current = element;
  while (current) {
    if (current instanceof HTMLElement) {
      if (classes.some((cls) => current && current.classList.contains(cls))) {
        return current;
      }
    }
    current = current.parentElement;
  }
  return null;
}

function distanceToPerimeter(
  gazeX: number,
  gazeY: number,
  boundingBox: DOMRect,
): number {
  const closestX = Math.max(
    boundingBox.left,
    Math.min(gazeX, boundingBox.right),
  );
  const closestY = Math.max(
    boundingBox.top,
    Math.min(gazeY, boundingBox.bottom),
  );
  const distanceX = gazeX - closestX;
  const distanceY = gazeY - closestY;
  return distanceX * distanceX + distanceY * distanceY;
}

export default function HighlightKey({ gazeData, onHighlight }: Props) {
  const lastHighlightedElement = useRef<HTMLElement | null>(null);
  const dwellStartTime = useRef<number | null>(null);
  const dwellTriggered = useRef<boolean>(false);
  const DWELL_THRESHOLD = 1400; 

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetRadius, setTargetRadius] = useState<string>("0px");
  const [targetColor, setTargetColor] = useState<string>("#ca9335");
  const [hoverKey, setHoverKey] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (lastHighlightedElement.current) {
        lastHighlightedElement.current.classList.remove(
          "key-active",
          "button-active",
          "sentence-active",
          "back-active"
        );
        if (lastHighlightedElement.current.classList.contains("top-bar-button")) {
          lastHighlightedElement.current.style.borderColor = "";
        }
        if (lastHighlightedElement.current.classList.contains("keyboard-section-overlay")) {
          lastHighlightedElement.current.parentElement?.classList.remove("section-parent-active");
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!gazeData) return;
    
    // make sure its a num
    if (isNaN(gazeData.x) || isNaN(gazeData.y)) return;

    const elementAtGazePoint = document.elementFromPoint(
      Math.max(0, gazeData.x),
      Math.max(0, gazeData.y),
    );
    let interactiveElement = findInteractiveParent(elementAtGazePoint);

    if (!interactiveElement) {
      const allElements = document.querySelectorAll(
        ".key, .top-bar-button, .sentence-container, .keyboard-section-overlay, .back-button, .spell-arrow-button",
      );

      let closest: { element: HTMLElement | null; distance: number } = {
        element: null,
        distance: Infinity,
      };

      allElements.forEach((node) => {
        const currentElement = node as HTMLElement;
        const boundingBox = currentElement.getBoundingClientRect();
        const distance = distanceToPerimeter(
          gazeData.x,
          gazeData.y,
          boundingBox,
        );

        if (distance < closest.distance) {
          closest = { element: currentElement, distance };
        }
      });

      // Proximity threshold
      if (closest.distance < 40000) { // 200px
        interactiveElement = closest.element;
      }
    }

    if (!interactiveElement) {
      // Clear dwell if we lose focus
      if (lastHighlightedElement.current) {
        lastHighlightedElement.current.classList.remove("key-active", "button-active", "sentence-active");
        if (lastHighlightedElement.current.classList.contains("top-bar-button")) {
          lastHighlightedElement.current.style.borderColor = "";
        }
      }
      dwellStartTime.current = null;
      dwellTriggered.current = false;
      lastHighlightedElement.current = null;
      setTargetRect(null);
      return;
    }

    if (lastHighlightedElement.current !== interactiveElement) {
      // Clean up previous
      if (lastHighlightedElement.current) {
        lastHighlightedElement.current.classList.remove(
          "key-active",
          "button-active",
          "sentence-active",
          "back-active"
        );
        if (lastHighlightedElement.current.classList.contains("top-bar-button")) {
          lastHighlightedElement.current.style.borderColor = "";
        }
        if (lastHighlightedElement.current.classList.contains("keyboard-section-overlay")) {
          lastHighlightedElement.current.parentElement?.classList.remove("section-parent-active");
        }
      }

      // Start new dwell
      dwellStartTime.current = Date.now();
      dwellTriggered.current = false;


      let rectElement = interactiveElement;
      if (interactiveElement.classList.contains("keyboard-section-overlay")) {
         if (interactiveElement.parentElement) {
            rectElement = interactiveElement.parentElement as HTMLElement;
         }
      }

      const rect = rectElement.getBoundingClientRect();
      setTargetRect(rect);
      setTargetRadius(window.getComputedStyle(rectElement).borderRadius);
      setHoverKey((prev) => prev + 1);

      let color = "#ca9335";
      if (interactiveElement.classList.contains("top-bar-button") || 
          interactiveElement.classList.contains("spell-arrow-button")) {
        color = interactiveElement.getAttribute("highlight-color") || "#ca9335";
        interactiveElement.classList.add("button-active");
        interactiveElement.style.borderColor = color;
      } else if (interactiveElement.classList.contains("sentence-container")) {
        color = "#6EC0FF";
        interactiveElement.classList.add("sentence-active");
      } else if (interactiveElement.classList.contains("keyboard-section-overlay")) {
        color = "#006ec2"; 
        interactiveElement.parentElement?.classList.add("section-parent-active");
      } else if (interactiveElement.classList.contains("back-button")) {
        color = "#ff6b6b";  
        interactiveElement.classList.add("back-active");
      } else if (interactiveElement.classList.contains("key")) {
      }
      setTargetColor(color);

      if (interactiveElement.classList.contains("key")) {
        const row = Number(interactiveElement.getAttribute("data-row"));
        const col = Number(interactiveElement.getAttribute("data-col"));
        if (!isNaN(row) && !isNaN(col)) {
          onHighlight(row, col);
        }
      }

      lastHighlightedElement.current = interactiveElement;
    } else {
      // Same element, check dwell time
      if (dwellStartTime.current && !dwellTriggered.current) {
        const elapsedTime = Date.now() - dwellStartTime.current;
        if (elapsedTime >= DWELL_THRESHOLD) {
          interactiveElement.click();
          dwellTriggered.current = true;
          console.log("Dwell trigger!", interactiveElement);
        }
      }
    }
  }, [gazeData, onHighlight]);

  if (!targetRect) return null;

  return (
    <svg
      key={hoverKey}
      className="dwell-progress-overlay"
      style={{
        left: targetRect.left,
        top: targetRect.top,
        width: targetRect.width,
        height: targetRect.height,
      }}
      viewBox={`0 0 ${targetRect.width} ${targetRect.height}`}
    >
      <rect
        className="dwell-progress-path"
        style={{ stroke: targetColor }}
        x="0"
        y="0"
        width={targetRect.width}
        height={targetRect.height}
        rx={targetRadius}
        ry={targetRadius}
        pathLength="1"
      />
    </svg>
  );
}
