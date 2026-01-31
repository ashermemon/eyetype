import React, { useEffect, useRef } from "react";

type Props = {
  gazeData: { x: number; y: number } | null;
  onHighlight: (row: number, column: number) => void;
};

const classes = ["key", "top-bar-button", "sentence-container"];

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

  useEffect(() => {
    if (!gazeData) return;

    const elementAtGazePoint = document.elementFromPoint(
      gazeData.x,
      gazeData.y,
    );
    let interactiveElement = findInteractiveParent(elementAtGazePoint);

    if (!interactiveElement) {
      const allElements = document.querySelectorAll(
        ".key, .top-bar-button, .sentence-container",
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

      interactiveElement = closest.element;
    }

    if (!interactiveElement) return;

    if (lastHighlightedElement.current !== interactiveElement) {
      if (lastHighlightedElement.current) {
        lastHighlightedElement.current.classList.remove("key-active");
        lastHighlightedElement.current.classList.remove("button-active");
        lastHighlightedElement.current.classList.remove("sentence-active");
        if (
          lastHighlightedElement.current.classList.contains("top-bar-button")
        ) {
          lastHighlightedElement.current.style.borderColor = "";
        }
      }

      if (interactiveElement.classList.contains("key")) {
        interactiveElement.classList.add("key-active");
        const row = Number(interactiveElement.getAttribute("data-row"));
        const column = Number(interactiveElement.getAttribute("data-column"));
        onHighlight(row, column);
      } else if (interactiveElement.classList.contains("top-bar-button")) {
        const highlightColor =
          interactiveElement.getAttribute("highlight-color") || "#ca9335";
        interactiveElement.style.borderColor = highlightColor;
        interactiveElement.classList.add("button-active");
      } else if (interactiveElement.classList.contains("sentence-container")) {
        interactiveElement.classList.add("sentence-active");
      }

      lastHighlightedElement.current = interactiveElement;
    }
  }, [gazeData, onHighlight]);

  return null;
}
