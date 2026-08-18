import type { PhrasingContent, Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h } from "../utils/remark";

const MAX_NUMBER_LENGTH = 20;

function getDirectiveTitle(node: ContainerDirective): PhrasingContent[] | undefined {
	const firstChild = node.children[0];
	if (
		firstChild?.type !== "paragraph" ||
		!firstChild.data ||
		!("directiveLabel" in firstChild.data) ||
		firstChild.children.length === 0
	) {
		return;
	}

	return firstChild.children;
}

function getTheoremNumber(node: ContainerDirective): string | undefined {
	const number = node.attributes?.number?.trim();
	if (!number || number.length > MAX_NUMBER_LENGTH) return;

	return number;
}

export const remarkTheorem: Plugin<[], Root> = () => (tree) => {
	visit(tree, "containerDirective", (node, index, parent) => {
		if (!parent || index === undefined || node.name !== "theorem") return;

		const title = getDirectiveTitle(node);
		const number = getTheoremNumber(node);
		const label = number ? `Theorem ${number}` : "Theorem";
		const titleText = title ? mdastToString(title) : undefined;
		const body = title ? node.children.slice(1) : node.children;

		parent.children[index] = h(
			"section",
			{
				"aria-label": titleText ? `${label}: ${titleText}` : label,
				class: "theorem-block",
			},
			[
				h("p", { class: "theorem-header" }, [
					h("strong", { class: "theorem-label" }, [{ type: "text", value: label }]),
					...(title
						? [
								h("span", { class: "theorem-title" }, [
									{ type: "text", value: "(" },
									...title,
									{ type: "text", value: ")" },
								]),
							]
						: []),
				]),
				h("div", { class: "theorem-body" }, body),
			],
		);
	});
};
