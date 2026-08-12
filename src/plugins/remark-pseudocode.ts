import type { PhrasingContent, Root, Strong, Text } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h } from "../utils/remark";

type RenderNode = PhrasingContent | ReturnType<typeof h>;

const META_VALUE_PATTERN = (name: string) =>
	new RegExp(`(?:^|\\s)${name}=(?:"([^"]*)"|'([^']*)'|([^\\s]+))`, "i");
const KEYWORD_PATTERN =
	/(\{[^{}]*\}|\b(?:end\s+(?:if|for|while|repeat)|else\s+if|if|then|else|for|while|repeat|until|do|return|break|continue)\b)/gi;
const INLINE_MATH_PATTERN = /\$([^$\n]+)\$/g;
const MAX_ALGORITHM_NUMBER = 999;
const MAX_INDENT_LEVEL = 12;

function readMetaValue(meta: string | null | undefined, name: string): string | undefined {
	const match = meta?.match(META_VALUE_PATTERN(name));
	return match?.[1] ?? match?.[2] ?? match?.[3];
}

function parseAlgorithmNumber(meta: string | null | undefined): string | undefined {
	const value = readMetaValue(meta, "number");
	if (!value || !/^\d{1,3}$/.test(value)) return;

	const number = Number(value);
	if (number < 1 || number > MAX_ALGORITHM_NUMBER) return;

	return value;
}

function parseText(value: string): RenderNode[] {
	const nodes: RenderNode[] = [];
	let cursor = 0;

	for (const match of value.matchAll(KEYWORD_PATTERN)) {
		const start = match.index ?? 0;
		if (start > cursor) nodes.push({ type: "text", value: value.slice(cursor, start) });

		const token = match[0];
		if (token.startsWith("{") && token.endsWith("}")) {
			nodes.push(h("span", { class: "pseudocode-comment" }, [{ type: "text", value: token }]));
		} else {
			nodes.push({
				children: [{ type: "text", value: token } satisfies Text],
				type: "strong",
			} satisfies Strong);
		}

		cursor = start + token.length;
	}

	if (cursor < value.length) nodes.push({ type: "text", value: value.slice(cursor) });
	return nodes;
}

function parseInline(value: string): RenderNode[] {
	const nodes: RenderNode[] = [];
	let cursor = 0;

	for (const match of value.matchAll(INLINE_MATH_PATTERN)) {
		const start = match.index ?? 0;
		if (start > cursor) nodes.push(...parseText(value.slice(cursor, start)));
		const expression = match[1] ?? "";
		nodes.push(h("span", { class: "pseudocode-math" }, [{ type: "text", value: expression }]));
		cursor = start + match[0].length;
	}

	if (cursor < value.length) nodes.push(...parseText(value.slice(cursor)));
	return nodes;
}

function getIndentLevel(line: string): number {
	const indentation = line.match(/^[\t ]*/)?.[0] ?? "";
	const spaces = [...indentation].reduce((total, character) => {
		return total + (character === "\t" ? 2 : 1);
	}, 0);

	return Math.min(Math.floor(spaces / 2), MAX_INDENT_LEVEL);
}

export const remarkPseudocode: Plugin<[], Root> = () => (tree) => {
	visit(tree, "code", (node, index, parent) => {
		if (!parent || index === undefined || node.lang?.toLowerCase() !== "pseudocode") return;

		const title = readMetaValue(node.meta, "title") ?? readMetaValue(node.meta, "caption");
		const algorithmNumber = parseAlgorithmNumber(node.meta);
		const inputs: Array<{ label: "Ensure" | "Require"; value: string }> = [];
		const steps: Array<{ indent: number; value: string }> = [];

		for (const rawLine of node.value.split(/\r?\n/)) {
			if (!rawLine.trim()) continue;

			const inputMatch = rawLine.trim().match(/^@(require|ensure)\s+(.+)$/i);
			if (inputMatch?.[1] && inputMatch[2]) {
				inputs.push({
					label: inputMatch[1].toLowerCase() === "require" ? "Require" : "Ensure",
					value: inputMatch[2],
				});
				continue;
			}

			steps.push({ indent: getIndentLevel(rawLine), value: rawLine.trim() });
		}

		const captionLabel = algorithmNumber ? `Algorithm ${algorithmNumber}` : "Algorithm";
		const captionChildren: RenderNode[] = [
			h("strong", { class: "pseudocode-caption-label" }, [{ type: "text", value: captionLabel }]),
		];
		if (title) captionChildren.push({ type: "text", value: ` ${title}` });

		const inputRows = inputs.map((input) =>
			h("div", { class: "pseudocode-input-row" }, [
				h("strong", { class: "pseudocode-input-label" }, [
					{ type: "text", value: `${input.label}:` },
				]),
				h("span", { class: "pseudocode-input-value" }, parseInline(input.value)),
			]),
		);
		const stepRows = steps.map((step, stepIndex) =>
			h("div", { class: "pseudocode-line" }, [
				h("span", { "aria-hidden": "true", class: "pseudocode-line-number" }, [
					{ type: "text", value: `${stepIndex + 1}:` },
				]),
				h(
					"span",
					{
						class: "pseudocode-line-content",
						style: `--pseudocode-indent:${step.indent}`,
					},
					parseInline(step.value),
				),
			]),
		);

		parent.children[index] = h(
			"figure",
			{ "aria-label": title ? `${captionLabel}: ${title}` : captionLabel, class: "pseudocode" },
			[
				h("figcaption", { class: "pseudocode-caption" }, captionChildren),
				...(inputRows.length > 0 ? [h("div", { class: "pseudocode-inputs" }, inputRows)] : []),
				h("div", { class: "pseudocode-body" }, stepRows),
			],
		);
	});
};
