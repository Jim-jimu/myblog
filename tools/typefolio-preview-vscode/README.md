# Typefolio Blog Preview

Preview Typefolio Astro blog posts from VS Code-compatible editors.

This extension does not implement its own Markdown renderer. It opens the real Astro blog route in a webview, so KaTeX, Expressive Code, admonitions, MDX, layout CSS, table of contents, and theme behavior come from the actual site.

## Usage

1. Open this blog repository in VS Code or Cursor.
2. Open a post under `src/content/blog/**/*.md` or `src/content/blog/**/*.mdx`.
3. Run `Typefolio Preview: Start Astro Dev Server` if the Astro server is not already running.
4. Run `Typefolio Preview: Open Blog Preview`.
5. Save the Markdown file to update the preview.

The preview URL is derived from the file path:

- `src/content/blog/example/index.md` -> `/blog/example/`
- `src/content/blog/testing/missing-content.md` -> `/blog/testing/missing-content/`

## Settings

- `typefolioPreview.serverUrl`: Astro dev server origin. Default: `http://localhost:4321`
- `typefolioPreview.basePath`: Astro base path. Default: `/`
- `typefolioPreview.blogContentRoot`: Blog content folder. Default: `src/content/blog`
- `typefolioPreview.devCommand`: Dev command sent to the terminal. Default: use `pnpm dev -- --host 127.0.0.1` when `pnpm` is available, otherwise use `npm run dev -- --host 127.0.0.1`.
- `typefolioPreview.previewOnSave`: Refresh after saving. Default: `true`
- `typefolioPreview.saveBeforeRefresh`: Save before toolbar refresh. Default: `false`
