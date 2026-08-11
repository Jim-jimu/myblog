import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h, isNodeDirective } from "../utils/remark";

const TEXT_COLORS = new Set([
	"blue",
	"gray",
	"green",
	"orange",
	"pink",
	"purple",
	"red",
	"teal",
	"yellow",
]);

function isTextColor(value: string): boolean {
	return TEXT_COLORS.has(value);
}

export const remarkTextColor: Plugin<[], Root> = () => (tree) => {
	visit(tree, "textDirective", (node, index, parent) => {
		if (!parent || index === undefined || !isNodeDirective(node)) return;

		const requestedColor =
			node.name === "color" ? node.attributes?.color?.toLowerCase() : node.name.toLowerCase();
		if (!requestedColor || !isTextColor(requestedColor)) return;

		parent.children[index] = h(
			"span",
			{ class: `markdown-text-color markdown-text-color-${requestedColor}` },
			node.children,
		);
	});
};
