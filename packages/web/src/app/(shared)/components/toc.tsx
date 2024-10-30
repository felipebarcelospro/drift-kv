"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy, Facebook, Linkedin, Twitter } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function TableOfContents() {
  const [headings, setHeadings] = useState<HTMLHeadingElement[]>([]);
  const [activeId, setActiveId] = useState("");
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  useEffect(() => {
    const elements = Array.from(document.querySelector('.markdown-content')?.querySelectorAll("h2, h3") || []).filter(
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

  const shareOnSocial = (platform: string) => {
    const text = "Check out this Drift KV documentation!";
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(currentUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
    };

    window.open(urls[platform as keyof typeof urls], '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
  };

  if (headings.length === 0) return null;

  return (
    <div className="space-y-6 sticky top-24 pb-20">
      <section className="flex flex-col gap-2">
        <header>
          <h3 className="text-lg font-semibold mb-2">Share this page</h3>
        </header>
        <main className="space-y-2">
          <Button variant="outline" className="w-full flex justify-start" onClick={() => shareOnSocial('twitter')}>
            <Twitter className="h-4 w-4" />
            <span className="ml-2">Share on Twitter</span>
          </Button>
          <Button variant="outline" className="w-full flex justify-start" onClick={() => shareOnSocial('linkedin')}>
            <Linkedin className="h-4 w-4" />
            <span className="ml-2">Share on LinkedIn</span>
          </Button>
          <Button variant="outline" className="w-full flex justify-start" onClick={() => shareOnSocial('facebook')}>
            <Facebook className="h-4 w-4" />
            <span className="ml-2">Share on Facebook</span>
          </Button>
          <Button variant="outline" className="w-full flex justify-start" onClick={copyLink}>
            <Copy className="h-4 w-4" />
            <span className="ml-2">Copy Link</span>
          </Button>
        </main>
      </section>

      <TOCMenu headings={headings} activeId={activeId} />

      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold mb-2">Try Drift KV Today</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Experience the power of modern key-value storage with Drift KV.
        </p>
        <Button className="w-full">
          Get Started
        </Button>
      </Card>
    </div>
  );
}

export function TOCMenu({ headings, activeId }: { headings: HTMLHeadingElement[], activeId: string }) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Group headings by H2 sections
  const sections = useMemo(() => {
    const grouped: Record<string, HTMLHeadingElement[]> = {};
    let currentH2: string | null = null;

    headings.forEach(heading => {
      if (heading.tagName === 'H2') {
        currentH2 = heading.id;
        grouped[currentH2] = [heading];
      } else if (currentH2 && heading.tagName === 'H3') {
        grouped[currentH2].push(heading);
      }
    });

    return grouped;
  }, [headings]);

  // Set active section open initially
  useEffect(() => {
    if (activeId) {
      const activeSection = Object.keys(sections).find(sectionId => 
        sections[sectionId].some(heading => heading.id === activeId)
      );
      if (activeSection) {
        setOpenSection(activeSection);
      }
    }
  }, [activeId, sections]);

  return (
    <nav className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="font-semibold text-lg">On This Page</p>
        <div className="h-px flex-1 bg-border" />
      </div>
      <ul className="space-y-3 text-sm">
        {headings.map((heading, index) => {
          if (heading.tagName === 'H2') {
            const hasSubheadings = sections[heading.id]?.length > 1;
            const isActive = heading.id === activeId || sections[heading.id]?.some(h => h.id === activeId);
            const isOpen = openSection === heading.id;

            return (
              <motion.li
                key={heading.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
              >
                {hasSubheadings ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setOpenSection(isOpen ? null : heading.id);
                        document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={cn(
                        "group flex w-full items-center justify-between py-1 text-muted-foreground transition-colors hover:text-foreground",
                        isActive && "text-foreground font-medium"
                      )}
                    >
                      <div className="flex items-center">
                        <span className={cn(
                          "mr-2 h-6 w-2 rounded-full bg-muted-foreground/40 transition-colors",
                          isActive && "bg-foreground",
                          "group-hover:bg-foreground/60"
                        )} />
                        {heading.textContent}
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "transform rotate-180"
                      )} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pl-4 space-y-2"
                        >
                          {sections[heading.id].slice(1).map((subheading) => (
                            <motion.li key={subheading.id}>
                              <a
                                href={`#${subheading.id}`}
                                className={cn(
                                  "group flex items-center py-1 text-muted-foreground transition-colors hover:text-foreground",
                                  activeId === subheading.id && "text-foreground font-medium"
                                )}
                              >
                                <span className={cn(
                                  "mr-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 transition-colors",
                                  activeId === subheading.id && "bg-foreground",
                                  "group-hover:bg-foreground/60"
                                )} />
                                {subheading.textContent}
                              </a>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    href={`#${heading.id}`}
                    className={cn(
                      "group flex items-center py-1 text-muted-foreground transition-colors hover:text-foreground",
                      isActive && "text-foreground font-medium"
                    )}
                  >
                    <span className={cn(
                      "mr-2 h-6 w-2 rounded-full bg-muted-foreground/40 transition-colors",
                      isActive && "bg-foreground",
                      "group-hover:bg-foreground/60"
                    )} />
                    {heading.textContent}
                  </a>
                )}
              </motion.li>
            );
          }
          return null;
        })}
      </ul>
    </nav>
  );
}
