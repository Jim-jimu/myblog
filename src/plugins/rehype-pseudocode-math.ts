import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const PSEUDOCODE_MATH_CLASS = "pseudocode-math";

function hasPseudocodeMathClass(node: Element): boolean {
	const classNames = node.properties.className;
	return Array.isArray(classNames) && classNames.includes(PSEUDOCODE_MATH_CLASS);
}

export const rehypePseudocodeMath: Plugin<[], Root> = () => (tree) => {
	visit(tree, "element", (node) => {
		if (node.tagName !== "span" || !hasPseudocodeMathClass(node)) return;

		node.tagName = "code";
		node.properties.className = ["language-math", "math-inline"];
	});
};
