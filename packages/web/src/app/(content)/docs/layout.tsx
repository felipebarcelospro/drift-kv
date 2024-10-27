import { FileSystemContentManager } from "@/lib/docs";
import { DocsLayout } from "./components/docs-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = await FileSystemContentManager.getAllNavigationItems();

  return <DocsLayout sections={sections}>{children}</DocsLayout>;
}
