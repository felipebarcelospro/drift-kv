import { config } from "@/configs/application";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border relative">
      <div className="container mx-auto py-8 md:max-w-screen-lg">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Built by{" "}
              <a
                href={config.githubUrl}
                className="text-primary hover:underline"
              >
                {config.developerName}
              </a>
              . The source code is available on{" "}
              <a
                href={config.githubUrl}
                className="text-primary hover:underline"
              >
                GitHub
              </a>
              .
            </span>
            <div className="flex space-x-2">
              <a
                href={config.twitterUrl}
                className="text-muted-foreground hover:text-primary bg-secondary dark:bg-card p-2 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
                </svg>
              </a>
              <a
                href={config.githubUrl}
                className="text-muted-foreground hover:text-primary bg-secondary dark:bg-card p-2 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-github"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
            </div>
          </div>
          <div className="flex space-x-4">
            <Link
              href={config.privacyPolicyUrl}
              className="text-muted-foreground hover:text-primary text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href={config.termsOfUseUrl}
              className="text-muted-foreground hover:text-primary text-sm"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
