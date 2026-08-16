import type { PhrasingContent, Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { h } from "../utils/remark";

function getDirectiveLabel(node: ContainerDirective): PhrasingContent[] | undefined {
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

function createColumn(node: ContainerDirective) {
	const title = getDirectiveLabel(node);
	const content = title ? node.children.slice(1) : node.children;

	return h("div", { class: "markdown-column" }, [
		...(title ? [h("p", { class: "markdown-column-title" }, title)] : []),
		...content,
	]);
}

export const remarkColumns: Plugin<[], Root> = () => (tree) => {
	visit(tree, "containerDirective", (node, index, parent) => {
		if (!parent || index === undefined || node.name !== "columns") return;

		const columns = node.children.filter(
			(child): child is ContainerDirective =>
				child.type === "containerDirective" && child.name === "column",
		);
		if (columns.length === 0 || columns.length !== node.children.length) return;

		parent.children[index] = h(
			"div",
			{ class: "markdown-columns", "data-column-count": columns.length },
			columns.map(createColumn),
		);
	});
};
