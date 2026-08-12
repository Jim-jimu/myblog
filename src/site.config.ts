import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
	// Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
	author: "Jimjimu",
	// Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
	date: {
		locale: "en-GB",
		options: {
			day: "numeric",
			month: "short",
			year: "numeric",
		},
	},
	// Used as the default description meta property and webmanifest description
	description:
		"A personal publishing site for technical writing, course notes, and Typst handouts.",
	// HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
	lang: "en-GB",
	// Meta property, found in src/components/BaseHead.astro L:42
	ogLocale: "en_GB",
	/*
		- Used to construct the meta title property found in src/components/BaseHead.astro L:11
		- The webmanifest name found in astro.config.ts L:42
		- The link value found in src/components/layout/Header.astro L:35
		- In the footer found in src/components/layout/Footer.astro L:12
	*/
	title: "Jimjimu Notes",
	// ! Please remember to replace the following site property with your own domain, used in astro.config.ts
	url: "https://jim-jimu.github.io/",
};

export const giscusConfig = {
	category: "Announcements",
	categoryId: "DIC_kwDORe2yqc4C3uHi",
	repo: "whliao5am/astro-theme-typefolio-giscus",
	repoId: "R_kgDORe2yqQ",
} as const;

// Toggle comment providers display without removing integration code.
export const commentDisplayConfig = {
	giscus: false,
} as const;

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: string }[] = [
	{
		path: "/",
		title: "Home",
	},
	{
		path: "/about/",
		title: "About",
	},
	{
		path: "/blog/",
		title: "Notes",
	},
	{
		path: "/projects/",
		title: "Projects",
	},
	{
		path: "/gallery/",
		title: "Gallery",
	},
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	styleOverrides: {
		borderRadius: "4px",
		codeFontFamily:
			'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
		codeFontSize: "0.8125rem",
		codeLineHeight: "1.55",
		codePaddingBlock: "0.75rem",
		codePaddingInline: "0.875rem",
		frames: {
			frameBoxShadowCssValue: "none",
		},
		uiFontSize: "0.8125rem",
		uiLineHeight: "1.55",
	},
	themeCssSelector(theme, { styleVariants }) {
		// If one dark and one light theme are available
		// generate theme CSS selectors compatible with typefolio-theme dark mode switch
		if (styleVariants.length >= 2) {
			const baseTheme = styleVariants[0]?.theme;
			const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
			if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
		}
		// return default selector
		return `[data-theme="${theme.name}"]`;
	},
	// One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
	themes: ["github-dark", "github-light"],
	useThemedScrollbars: false,
};
