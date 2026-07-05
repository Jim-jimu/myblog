---
title: "Start Writing with Typefolio"
description: "The writing workflow for this site: regular notes in Markdown, formal handouts in Typst, and PDFs embedded in pages."
publishDate: "2026-07-06"
tags: ["astro", "typst", "writing"]
pinned: true
---

This post can serve as the starting point for future writing.

Regular technical notes go directly under `src/content/blog/`. Each post can be
a single `.md` file, or it can live in a folder with an `index.md`, like this
post.

## Math

Typefolio is already configured with KaTeX, so inline math works directly:
$E=mc^2$.

Block math also renders correctly:

$$
\int_0^1 x^2\,dx=\frac{1}{3}
$$

## Code Blocks

````md
```ts title="example.ts"
const site = "Jimjimu Notes";
console.log(site);
```
````

Rendered result:

```ts title="example.ts"
const site = "Jimjimu Notes";
console.log(site);
```

## Typst / PDF

If a piece of content is closer to a handout, assignment, or report, write it in
Typst in a separate directory:

```text
typst/
  linear-algebra/
    hw1.typ
```

Compile it to PDF and place the output under `public/pdf/`:

```bash
typst compile typst/linear-algebra/hw1.typ public/pdf/linear-algebra-hw1.pdf
```

Then embed it in a post:

```html
<iframe
  src="/pdf/linear-algebra-hw1.pdf"
  width="100%"
  height="800"
  style="border: 1px solid #ddd; border-radius: 8px;"
></iframe>
```

Keep a download link as well, because some mobile browsers do not render
embedded PDFs reliably.
