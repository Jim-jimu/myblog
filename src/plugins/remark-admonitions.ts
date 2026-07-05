import type { Parent, PhrasingContent, Root } from "mdast";
import type { LeafDirective, TextDirective } from "mdast-util-directive";
import { directiveToMarkdown } from "mdast-util-directive";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { AdmonitionType } from "@/types";
import { h, isNodeDirective } from "../utils/remark";

// Supported admonition types
const Admonitions = new Set<AdmonitionType>(["tip", "note", "important", "caution", "warning"]);
const ObsidianAdmonitionAliases = new Map<string, AdmonitionType>([
	["abstract", "note"],
	["bug", "warning"],
	["danger", "caution"],
	["error", "caution"],
	["example", "note"],
	["failure", "caution"],
	["faq", "note"],
	["help", "note"],
	["info", "note"],
	["question", "note"],
	["quote", "note"],
	["success", "tip"],
	["summary", "note"],
	["todo", "note"],
]);

/** Checks if a string is a supported admonition type. */
function isAdmonition(s: string): s is AdmonitionType {
	return Admonitions.has(s as AdmonitionType);
}

/**
 * From Astro Starlight:
 * Transforms directives not supported back to original form as it can break user content and result in 'broken' output.
 */
function transformUnhandledDirective(
	node: LeafDirective | TextDirective,
	index: number,
	parent: Parent,
) {
	const textNode = {
		type: "text",
		value: toMarkdown(node, { extensions: [directiveToMarkdown()] }),
	} as const;
	if (node.type === "textDirective") {
		parent.children[index] = textNode;
	} else {
		parent.children[index] = {
			children: [textNode],
			type: "paragraph",
		};
	}
}

function createAdmonition(
	admonitionType: AdmonitionType,
	title: string,
	titleNode: PhrasingContent[],
	children: Root["children"],
) {
	// Do not change prefix to AD, ADM, or similar, adblocks will block the content inside.
	return h(
		"aside",
		{ "aria-label": title, class: "admonition", "data-admonition-type": admonitionType },
		[
			h("p", { class: "admonition-title", "aria-hidden": "true" }, [...titleNode]),
			h("div", { class: "admonition-content" }, children),
		],
	);
}

export const remarkAdmonitions: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node, index, parent) => {
		if (!parent || index === undefined || !isNodeDirective(node)) return;
		if (node.type === "textDirective" || node.type === "leafDirective") {
			transformUnhandledDirective(node, index, parent);
			return;
		}

		const admonitionType = node.name;
		if (!isAdmonition(admonitionType)) return;

		let title: string = admonitionType;
		let titleNode: PhrasingContent[] = [{ type: "text", value: title }];

		// Check if there's a custom title
		const firstChild = node.children[0];
		if (
			firstChild?.type === "paragraph" &&
			firstChild.data &&
			"directiveLabel" in firstChild.data &&
			firstChild.children.length > 0
		) {
			titleNode = firstChild.children;
			title = mdastToString(firstChild.children);
			// The first paragraph contains a custom title, we can safely remove it.
			node.children.splice(0, 1);
		}

		parent.children[index] = createAdmonition(admonitionType, title, titleNode, node.children);
	});

	visit(tree, "blockquote", (node, index, parent) => {
		if (!parent || index === undefined) return;

		const firstChild = node.children[0];
		if (firstChild?.type !== "paragraph") return;

		const firstText = firstChild.children[0];
		if (firstText?.type !== "text") return;

		const [firstLine = "", ...remainingLines] = firstText.value.split("\n");
		const match = firstLine.match(/^\[!(?<type>[a-z]+)\][+-]?\s*(?<title>.*)$/i);
		if (!match?.groups?.type) return;

		const rawType = match.groups.type.toLowerCase();
		const admonitionType = isAdmonition(rawType) ? rawType : ObsidianAdmonitionAliases.get(rawType);
		if (!admonitionType) return;

		const title = match.groups.title?.trim() || rawType;
		const titleNode: PhrasingContent[] = [{ type: "text", value: title }];

		if (remainingLines.length > 0) {
			firstText.value = remainingLines.join("\n");
		} else {
			firstChild.children.shift();
			if (firstChild.children.length === 0) node.children.shift();
		}

		parent.children[index] = createAdmonition(admonitionType, title, titleNode, node.children);
	});
};
