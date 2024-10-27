import Link from "next/link";

import { cn } from "@/lib/utils";
import type { MDXComponents } from "mdx/types";
import React, { DetailedHTMLProps, HTMLAttributes } from "react";

type HeadingProps = DetailedHTMLProps<
  HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;
type ParagraphProps = DetailedHTMLProps<
  HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>;
type PreProps = DetailedHTMLProps<
  HTMLAttributes<HTMLPreElement>,
  HTMLPreElement
>;
type CodeProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
type UListProps = DetailedHTMLProps<
  HTMLAttributes<HTMLUListElement>,
  HTMLUListElement
>;
type OListProps = DetailedHTMLProps<
  HTMLAttributes<HTMLOListElement>,
  HTMLOListElement
>;
type ListItemProps = DetailedHTMLProps<
  HTMLAttributes<HTMLLIElement>,
  HTMLLIElement
>;
type AnchorProps = DetailedHTMLProps<
  HTMLAttributes<HTMLAnchorElement>,
  HTMLAnchorElement
> & {
  href?: string;
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, ...props }: HeadingProps) => (
      <h1
        className="scroll-m-20 text-4xl font-bold tracking-tight mb-8"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: HeadingProps) => (
      <h2
        className="scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight mt-16 mb-6"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: HeadingProps) => (
      <h3
        className="scroll-m-20 text-xl font-semibold tracking-tight mt-12 mb-4"
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }: ParagraphProps) => (
      <p className="leading-7 text-muted-foreground mb-6" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: UListProps) => (
      <ul className="flex flex-col gap-4 my-8" {...props}>
        {React.Children.map(children, (child, index) =>
          React.isValidElement(child)
            ? React.cloneElement(child, { key: index })
            : child,
        )}
      </ul>
    ),
    ol: ({ children, ...props }: OListProps) => (
      <ol className="flex flex-col gap-4 my-8 list-decimal pl-4" {...props}>
        {React.Children.map(children, (child, index) =>
          // @ts-ignore
          React.isValidElement(child)
            ? React.cloneElement(child, {
                key: index,
                ...props,
                // @ts-ignore
                className: cn(props.className, "ordered-list-item"),
              })
            : child,
        )}
      </ol>
    ),
    li: ({ children, ...props }: ListItemProps) => {
      // Check if the child is a link
      const isLink = React.Children.toArray(children).some(
        (child) =>
          React.isValidElement(child) &&
          (child.type === "a" || child.type === Link),
      );

      // Check if content starts with <strong> followed by colon
      const childArray = React.Children.toArray(children);
      const hasStrongWithColon =
        React.isValidElement(childArray[0]) &&
        childArray[0].type === "strong" &&
        String(childArray[1]).startsWith(": ");

      // Check if this is part of an ordered list
      const isOrderedList = props.className?.includes("ordered-list-item");

      if (hasStrongWithColon) {
        const [strongElement, ...restContent] = childArray;
        const textContent = restContent.join("").replace(/^:\s*/, "");

        return (
          <li
            className={cn(
              "p-4 bg-secondary border border-border rounded-lg shadow-sm transition-shadow duration-200",
              isLink ? "p-0" : "hover:shadow-md",
            )}
            {...props}
          >
            <div className="flex flex-col gap-1">
              <div className="font-semibold">{strongElement}</div>
              <div className="text-card-foreground">{textContent}</div>
            </div>
          </li>
        );
      }

      if (isOrderedList) {
        return (
          <li
            className={cn("pl-2 text-card-foreground", props.className)}
            {...props}
          >
            {children}
          </li>
        );
      }

      return (
        <li
          className={cn(
            "p-4 bg-secondary border border-border rounded-lg shadow-sm transition-shadow duration-200",
            "list-none",
            isLink ? "p-0" : "hover:shadow-md",
          )}
          {...props}
        >
          {isLink ? (
            React.Children.map(children, (child, index) =>
              React.isValidElement(child)
                ? React.cloneElement(child, { key: `link-${index}` })
                : child,
            )
          ) : (
            <div className="flex items-center">
              <span className="text-card-foreground">{children}</span>
            </div>
          )}
        </li>
      );
    },
    a: ({ children, href = "", ...props }: AnchorProps) => {
      const isListItem = props.className?.includes("list-item");

      if (href.startsWith("http")) {
        return (
          <a
            href={href}
            className={cn(
              "font-medium no-underline",
              isListItem
                ? "block p-4 hover:bg-muted hover:shadow-md transition-all duration-200"
                : "hover:text-primary",
            )}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          href={href}
          className={cn(
            "font-medium no-underline",
            isListItem
              ? "block p-4 hover:bg-muted hover:shadow-md transition-all duration-200"
              : "hover:text-primary",
          )}
          {...props}
        >
          {children}
        </Link>
      );
    },
    pre: ({ children, ...props }: PreProps) => (
      <div className="relative border border-border rounded-md overflow-hidden shadow-md bg-background">
        <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-border">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-destructive hover:opacity-80 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[hsl(43_74%_66%)] dark:bg-[hsl(30_80%_55%)] hover:opacity-80 transition-opacity" />
            <div className="w-3 h-3 rounded-full bg-[hsl(142_76%_36%)] dark:bg-[hsl(142_76%_46%)] hover:opacity-80 transition-opacity" />
          </div>
        </div>
        <pre {...props} className="p-4 overflow-x-auto">
          {React.Children.map(children, (child, index) =>
            React.isValidElement(child)
              ? React.cloneElement(child, { key: `code-${index}` })
              : child,
          )}
        </pre>
      </div>
    ),
    code: ({ children, ...props }: CodeProps) => (
      <code
        suppressHydrationWarning
        className="hljs"
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
        {...props}
      >
        {children}
      </code>
    ),
    ...components,
  };
}
