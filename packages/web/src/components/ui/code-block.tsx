"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import * as React from "react";
import { CodeBlock as CodeBlockComponent } from "react-code-blocks";

interface TechnologyOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  code: string;
  language?: string;
}

interface CodeBlockContextValue {
  activeTech: string;
  setActiveTech: (tech: string) => void;
  copied: boolean;
  setCopied: (copied: boolean) => void;
  technologies: TechnologyOption[];
}

const CodeBlockContext = React.createContext<CodeBlockContextValue | undefined>(
  undefined,
);

function useCodeBlock() {
  const context = React.useContext(CodeBlockContext);
  if (!context) {
    throw new Error("useCodeBlock must be used within a CodeBlockProvider");
  }
  return context;
}

const CodeBlock = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    technologies: TechnologyOption[];
    defaultTech?: string;
  }
>(
  (
    { className, technologies, defaultTech = technologies[0]?.id, ...props },
    ref,
  ) => {
    const [activeTech, setActiveTech] = React.useState(defaultTech);
    const [copied, setCopied] = React.useState(false);

    return (
      <CodeBlockContext.Provider
        value={{
          activeTech,
          setActiveTech,
          copied,
          setCopied,
          technologies,
        }}
      >
        <div
          ref={ref}
          className={cn(
            "relative border border-border rounded-md overflow-hidden shadow-md transition-colors duration-300",
            copied ? "bg-green-950" : "bg-background",
            className,
          )}
          {...props}
        />
      </CodeBlockContext.Provider>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

const CodeBlockHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { activeTech, setActiveTech, copied, setCopied, technologies } =
    useCodeBlock();

  const handleCopy = () => {
    const activeTechCode = technologies.find((t) => t.id === activeTech)?.code;
    if (activeTechCode) {
      navigator.clipboard.writeText(activeTechCode.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between px-4 py-2 bg-secondary border-b border-border",
        className,
      )}
      {...props}
    >
      <div className="flex space-x-2">
        <div className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80 transition-opacity" />
        <div className="w-3 h-3 rounded-full bg-yellow-500 hover:opacity-80 transition-opacity" />
        <div className="w-3 h-3 rounded-full bg-green-500 hover:opacity-80 transition-opacity" />
      </div>
      <div className="flex items-center gap-2">
        <div className="relative z-10">
          <motion.div
            className="flex p-1 bg-muted/80 backdrop-blur-sm rounded-lg"
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            {technologies.map((tech) => (
              <motion.button
                key={tech.id}
                onClick={() => setActiveTech(tech.id)}
                className={cn(
                  "flex items-center justify-center px-3 py-1 cursor-pointer rounded-md transition-colors duration-200",
                  activeTech === tech.id &&
                    "bg-background shadow-sm text-foreground",
                  activeTech !== tech.id &&
                    "text-muted-foreground hover:text-foreground",
                )}
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                }}
              >
                <div className="flex items-center space-x-2">
                  {tech.icon}
                  <span>{tech.name}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 17,
          }}
        >
          <motion.div
            initial={{ rotate: 0 }}
            whileTap={{ rotate: 360 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
            }}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
});
CodeBlockHeader.displayName = "CodeBlockHeader";

interface CodeBlockContentProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  showCopiedOverlay?: boolean;
}

const CodeBlockContent = React.forwardRef<
  HTMLDivElement,
  CodeBlockContentProps
>(
  (
    {
      className,
      code,
      language = "shell",
      showCopiedOverlay = false,
      ...props
    },
    ref,
  ) => {
    const codeTheme = {
      backgroundColor: "#111",
      textColor: "#abb2bf",
      lineNumberColor: "#6272a4",
      keywordColor: "#c678dd",
      stringColor: "#98c379",
      functionColor: "#61afef",
      variableColor: "#e06c75",
      substringColor: "#e06c75",
    };

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <CodeBlockComponent
          text={code.trim()}
          language={language}
          theme={codeTheme}
          showLineNumbers={false}
          codeContainerStyle={{
            backgroundColor: "transparent",
            padding: "16px",
            width: "100%",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: "14px",
            lineHeight: "1.5",
            letterSpacing: "-0.025em",
          }}
        />
        {showCopiedOverlay && (
          <div
            className={cn(
              "absolute inset-0 opacity-50 transition-opacity duration-500",
              "bg-green-950"
            )}
          />
        )}
      </div>
    );
  },
);
CodeBlockContent.displayName = "CodeBlockContent";

const ConnectedCodeBlockContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "code"> & {
    language?: string;
  }
>(({ className, language = "shell", ...props }, ref) => {
  const { activeTech, copied, technologies } = useCodeBlock();

  const activeTechnology = technologies.find((t) => t.id === activeTech);
  const activeCode = activeTechnology?.code || "";
  const activeLanguage = activeTechnology?.language || language;

  return (
    <CodeBlockContent
      ref={ref}
      code={activeCode}
      language={activeLanguage}
      showCopiedOverlay={copied}
      className={className}
      {...props}
    />
  );
});
ConnectedCodeBlockContent.displayName = "ConnectedCodeBlockContent";

export {
  CodeBlock,
  CodeBlockContent,
  CodeBlockHeader,
  ConnectedCodeBlockContent
};

