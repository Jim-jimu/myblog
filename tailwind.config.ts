import type { Config } from "tailwindcss";

export default {
	plugins: [require("@tailwindcss/typography")],
	theme: {
		extend: {
			typography: () => ({
				DEFAULT: {
					css: {
						a: {
							textUnderlineOffset: "2px",
							"&:hover": {
								"@media (hover: hover)": {
									textDecorationColor: "var(--color-link)",
									textDecorationThickness: "2px",
								},
							},
						},
						code: {
							backgroundColor: "var(--color-inline-code-bg)",
							borderRadius: "2px",
						},
						kbd: {
							"&:where([data-theme='dark'], [data-theme='dark'] *)": {
								color: "var(--tw-prose-invert-kbd)",
								backgroundColor: "color-mix(in oklab, var(--tw-prose-invert-kbd) 8%, transparent)",
								boxShadow:
									"0 0 0 1px var(--tw-prose-invert-kbd-shadows), 0 3px 0 var(--tw-prose-invert-kbd-shadows)",
							},
						},
						hr: {
							borderTopStyle: "solid",
							borderTopColor: "var(--color-rule)",
						},
						strong: {
							fontWeight: "700",
						},
						sup: {
							marginInlineStart: "calc(var(--spacing) * 0.5)",
							a: {
								"&:after": {
									content: "']'",
								},
								"&:before": {
									content: "'['",
								},
								"&:hover": {
									"@media (hover: hover)": {
										color: "var(--color-link)",
									},
								},
							},
						},
						".expressive-code, .admonition, .github-card": {
							marginTop: "calc(var(--spacing)*3)",
							marginBottom: "calc(var(--spacing)*3)",
						},
						/* Table */
						"tbody tr": {
							borderBottomWidth: "none",
						},
						tfoot: {
							borderTop: "1px dashed #666",
						},
						thead: {
							borderBottomWidth: "none",
						},
						"thead th": {
							borderBottom: "1px dashed #666",
							fontWeight: "700",
						},
						'th[align="center"], td[align="center"]': {
							"text-align": "center",
						},
						'th[align="right"], td[align="right"]': {
							"text-align": "right",
						},
						'th[align="left"], td[align="left"]': {
							"text-align": "left",
						},
					},
				},
				sm: {
					css: {
						code: {
							fontSize: "var(--text-sm)",
							fontWeight: "400",
						},
						h2: {
							marginTop: "1.4em",
							marginBottom: "0.7em",
						},
						h3: {
							marginTop: "1.2em",
							marginBottom: "0.55em",
						},
						h4: {
							marginTop: "1.2em",
							marginBottom: "0.45em",
						},
						p: {
							marginTop: "0.4em",
							marginBottom: "0.4em",
							lineHeight: "1.5",
							letterSpacing: "0.02em",
							wordSpacing: "0.06em",
						},
						"ul, ol": {
							marginTop: "0.6em",
							marginBottom: "0.6em",
						},
						li: {
							marginTop: "0.4em",
							marginBottom: "0.4em",
							lineHeight: "1.5",
							letterSpacing: "0.02em",
							wordSpacing: "0.06em",
						},
						"ul > li > ul, ul > li > ol, ol > li > ul, ol > li > ol": {
							marginTop: "0",
							marginBottom: "0",
						},
						table: {
							marginTop: "calc(var(--spacing)*3)",
							marginBottom: "calc(var(--spacing)*3)",
						},
						hr: {
							marginTop: "calc(var(--spacing)*6)",
							marginBottom: "calc(var(--spacing)*6)",
						},
						blockquote: {
							borderLeftWidth: "0",
							marginTop: "0.4em",
							marginBottom: "0.4em",
						},
						"blockquote p": {
							marginTop: "0",
							marginBottom: "0",
						},
					},
				},
			}),
		},
	},
} satisfies Config;
