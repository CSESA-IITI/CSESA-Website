"use client";

import { useScroll, useTransform, motion } from "framer-motion"; 
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setHeight(entry.target.clientHeight);
        }
      });
      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [50, height]); // Start from 50 to be visible
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div ref={containerRef} className="w-full bg-white dark:bg-neutral-950 font-sans md:px-10">
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-black dark:text-white max-w-4xl">
          Changelog from my journey
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-sm md:text-base max-w-sm">
          I've been working on Aceternity for the past 2 years. Here's a timeline of my journey.
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto pb-20">
        {/* FIX: Moved the ref to the content wrapper */}
        <div ref={contentRef}>
          {data.map((item, index) => (
            <div key={index} className=" flex justify-start pt-10 md:pt-40 md:gap-10 relative min-h-screen">
              <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full h-fit">
                <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
                </div>
                <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
                  {item.title}
                </h3>
              </div>
              <div className="relative pl-20 pr-4 md:pl-4 w-full">
                <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                  {item.title}
                </h3>
                {item.content}
              </div>
            </div>
          ))}
        </div>

        {/* Vertical Line */}
        <div
          style={{ height: `${height}px` }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-neutral-200 dark:bg-neutral-800 rounded-full"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};