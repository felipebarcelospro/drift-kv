"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function TableOfContents() {
  const [headings, setHeadings] = useState<HTMLHeadingElement[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2, h3")).filter(
      (element): element is HTMLHeadingElement =>
        element instanceof HTMLHeadingElement,
    );
    setHeadings(elements);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-2">
      <p className="font-medium">On This Page</p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading, index) => (
          <motion.li
            key={`${heading.id}-${index}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <a
              href={`#${heading.id}`}
              className={cn(
                "block text-muted-foreground hover:text-foreground",
                heading.tagName === "H3" && "pl-4",
                activeId === heading.id && "text-foreground font-medium",
              )}
            >
              {heading.textContent}
            </a>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}
