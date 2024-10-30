"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentSection } from "@/lib/docs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarClientProps = {
  sidebarItems: ContentSection[];
};

export function SidebarClient({ sidebarItems }: SidebarClientProps) {
  const pathname = usePathname();

  return (
    <ScrollArea className="h-[calc(100vh-3.5rem)]">
      <div className="space-y-4">
        {sidebarItems.map((section, index) => (
          <motion.div
            key={`${section.title}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="px-3 py-2"
          >
            <h2
              className="mb-2 px-4 text-lg font-semibold tracking-tight truncate"
              title={section.title}
            >
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                >
                  <Button
                    asChild
                    variant={pathname === item.slug ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.slug && "bg-muted font-medium",
                    )}
                  >
                    <Link
                      href={item.slug}
                      className="truncate"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}
