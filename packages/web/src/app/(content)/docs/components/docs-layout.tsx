"use client";

import { CTASection } from "@/app/(shared)/components/cta";
import { TableOfContents } from "@/app/(shared)/components/toc";
import { motion } from "framer-motion";
import { Search } from "./search";
import { Sidebar } from "./sidebar";

interface DocsLayoutProps {
  children: React.ReactNode;
  sections: any[]; // Ajuste o tipo conforme necessário
}

export function DocsLayout({ children, sections }: DocsLayoutProps) {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-12 gap-8">
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sidebar sections={sections} />
        </motion.div>

        <motion.main
          className="col-span-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Search sections={sections} className="mb-8" />
          {children}
          <CTASection />
        </motion.main>

        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TableOfContents />
        </motion.div>
      </div>
    </motion.div>
  );
}
