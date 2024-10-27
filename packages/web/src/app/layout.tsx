import "./globals.css";

import { Footer } from "@/app/(shared)/components/footer";
import { Header } from "@/app/(shared)/components/header";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { config } from "@/configs/application";
import { githubService } from "@/lib/github";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./(shared)/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./(shared)/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: config.projectName,
  description: config.projectDescription,
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const repoInfo = await githubService.getRepositoryInfo();

  return (
    <html lang="en" suppressContentEditableWarning suppressHydrationWarning>
      <body
        className={cn(geistSans.variable, geistMono.variable, "antialiased")}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Header repoInfo={repoInfo} />
          <GoogleAnalytics
            gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? ""}
          />
          <div>{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
