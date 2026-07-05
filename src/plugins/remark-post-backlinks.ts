import type { Link, Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { getPostIdFromFilePath, resolvePostLinkToId } from "../utils/backlinks";

interface AstroFileData {
	astro?: {
		frontmatter?: Record<string, unknown>;
	};
}

interface RemarkFile {
	history: string[];
	path?: string;
	data: AstroFileData;
}

export const remarkPostBacklinks: Plugin<[], Root> = () => (tree, file) => {
	const astroFile = file as RemarkFile;
	const currentPostId = getPostIdFromFilePath(astroFile.path ?? astroFile.history[0] ?? "");
	if (!currentPostId) return;

	const outboundPostLinks = new Set<string>();

	visit(tree, "link", (node: Link) => {
		const linkedPostId = resolvePostLinkToId(node.url, { currentPostId });
		if (linkedPostId) outboundPostLinks.add(linkedPostId);
	});

	astroFile.data.astro ??= {};
	astroFile.data.astro.frontmatter ??= {};
	astroFile.data.astro.frontmatter.outboundPostLinks = [...outboundPostLinks];
};
