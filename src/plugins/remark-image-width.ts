import type { Image, Parent, Root, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const IMAGE_WIDTH_CLASS = "markdown-image-width";
const MAX_PIXEL_WIDTH = 4096;
const WIDTH_ATTRIBUTE = /^\s*\{\s*width\s*=\s*(?:"([^"]+)"|'([^']+)'|([^}\s]+))\s*\}/i;

function normalizeWidth(value: string): string | undefined {
	const pixelMatch = value.match(/^(\d+)(?:px)?$/i);
	if (pixelMatch) {
		const pixels = Number(pixelMatch[1]);
		if (pixels > 0 && pixels <= MAX_PIXEL_WIDTH) return `${pixels}px`;
		return;
	}

	const percentageMatch = value.match(/^(\d+(?:\.\d+)?)%$/);
	if (!percentageMatch) return;

	const percentage = Number(percentageMatch[1]);
	if (percentage <= 0 || percentage > 100) return;

	return `${percentage}%`;
}

function addImageWidth(node: Image, width: string) {
	node.data ??= {};
	const data = node.data;
	data.hProperties ??= {};
	const properties = data.hProperties;
	const existingClassNames = Array.isArray(properties.className)
		? properties.className.map(String)
		: typeof properties.className === "string"
			? properties.className.split(/\s+/)
			: [];

	properties.className = [...new Set([...existingClassNames, IMAGE_WIDTH_CLASS])];
	const existingStyle = typeof properties.style === "string" ? properties.style.trim() : "";
	const styleSeparator = existingStyle && !existingStyle.endsWith(";") ? ";" : "";
	properties.style = `${existingStyle}${styleSeparator}--markdown-image-width:${width}`;
}

export const remarkImageWidth: Plugin<[], Root> = () => (tree) => {
	visit(tree, "image", (node, index, parent) => {
		if (!parent || index === undefined) return;

		const nextNode = (parent as Parent).children[index + 1] as Text | undefined;
		if (nextNode?.type !== "text") return;

		const match = nextNode.value.match(WIDTH_ATTRIBUTE);
		const rawWidth = match?.[1] ?? match?.[2] ?? match?.[3];
		if (!match || !rawWidth) return;

		const width = normalizeWidth(rawWidth);
		if (!width) return;

		addImageWidth(node, width);

		const remainingText = nextNode.value.slice(match[0].length);
		if (remainingText) {
			nextNode.value = remainingText;
		} else {
			(parent as Parent).children.splice(index + 1, 1);
		}
	});
};
