import { useEffect, useState } from "react";

export function useSectionProgress(sectionIds: string[]) {
  const [progressMap, setProgressMap] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const updateProgress = () => {
      const newProgressMap: { [key: string]: number } = {};

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          const totalHeight = rect.height;
          const scrolled = Math.min(Math.max(windowHeight - rect.top, 0), totalHeight);
          const progress = totalHeight > 0 ? scrolled / totalHeight : 0;

          newProgressMap[id.toUpperCase()] = Math.min(progress, 1);
        }
      });

      setProgressMap(newProgressMap);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [sectionIds]);

  return progressMap;
}