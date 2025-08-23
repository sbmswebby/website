"use client";
import { useEffect } from "react";

export default function FairyCursor() {
  useEffect(() => {
    const cursor: HTMLDivElement = document.createElement("div");
    cursor.style.position = "fixed";
    cursor.style.zIndex = "9999";
    cursor.style.pointerEvents = "none";
    cursor.style.fontSize = "40px";
    cursor.style.transform = "translate(-50%, -50%)";
    cursor.innerText = "🖌️";
    document.body.appendChild(cursor);

    let lastSparkleTime = 0;

    const moveCursor = (e: MouseEvent) => {
      // ✅ Detect if hovering a button, link, or input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.getAttribute("role") === "button"
      ) {
        cursor.style.display = "none"; // hide custom cursor
        document.body.style.cursor = "auto"; // restore default cursor
      } else {
        cursor.style.display = "block"; // show brush
        document.body.style.cursor = "none"; // hide system cursor
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;

        const now = Date.now();
        if (now - lastSparkleTime > 50) {
          createSparkle(e.clientX + (Math.random() * 20 - 10), e.clientY - 15);
          lastSparkleTime = now;
        }
      }
    };

    const createSparkle = (x: number, y: number) => {
      const sparkle: HTMLDivElement = document.createElement("div");
      sparkle.innerText = "✨";
      sparkle.style.position = "fixed";
      sparkle.style.left = `${x}px`;
      sparkle.style.top = `${y}px`;
      sparkle.style.fontSize = "14px";
      sparkle.style.pointerEvents = "none";
      sparkle.style.opacity = "1";
      sparkle.style.transition = "all 1s ease-out, color 1s ease-out";
      sparkle.style.color = "gold"; // start yellow
      document.body.appendChild(sparkle);

      requestAnimationFrame(() => {
        sparkle.style.transform = `translate(${Math.random() * 100 - 50}px, ${
          Math.random() * 80 - 40
        }px) scale(${0.3 + Math.random() * 0.5})`;
        sparkle.style.opacity = "0";
        sparkle.style.color = "hotpink"; // fade to pink
      });

      setTimeout(() => sparkle.remove(), 1000);
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      cursor.remove();
      document.body.style.cursor = "auto";
    };
  }, []);

  return null;
}
