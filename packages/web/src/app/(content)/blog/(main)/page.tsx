import { CTASection } from "@/app/(shared)/components/cta";
import { FileSystemContentManager } from "@/lib/docs";
import { BlogList } from "./components/blog-list";

export default async function Page() {
  const segments = await FileSystemContentManager.getNavigationItems("blog");

  return (
    <div className="container mx-auto px-8 py-16">
      <BlogList posts={segments} />
      <CTASection />
    </div>
  );
}
