import path from "node:path";
import { siteConfig } from "../site.config";

const siteOrigin = new URL(siteConfig.url).origin;

export function getPostIdFromFilePath(filePath: string): string | undefined {
	const normalizedPath = filePath.split(path.sep).join("/");
	const contentRoot = "/src/content/blog/";
	const rootIndex = normalizedPath.lastIndexOf(contentRoot);
	if (rootIndex === -1) return;

	const relativePath = normalizedPath.slice(rootIndex + contentRoot.length);
	const withoutExtension = relativePath.replace(/\.(md|mdx)$/u, "");

	return withoutExtension.replace(/\/index$/u, "");
}

export function resolvePostLinkToId(
	href: string,
	{ currentPostId }: { currentPostId?: string } = {},
): string | undefined {
	if (!href || href.startsWith("#")) return;

	const baseUrl = new URL(`/blog/${currentPostId ? `${currentPostId}/` : ""}`, siteConfig.url);
	const resolvedUrl = new URL(href, baseUrl);
	if (resolvedUrl.origin !== siteOrigin) return;

	const pathSegments = resolvedUrl.pathname.split("/").filter(Boolean);
	if (!["blog"].includes(pathSegments[0] ?? "") || pathSegments.length < 2) return;

	return pathSegments.slice(1).join("/");
}
