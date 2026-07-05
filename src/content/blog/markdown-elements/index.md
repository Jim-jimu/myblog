---
title: "Markdown Elements"
description: "A reference post covering the Markdown and MDX-friendly formatting available in Typefolio."
publishDate: "22 Feb 2026"
tags: ["markdown", "writing"]
pinned: true
---

This reference post collects the core Markdown patterns that Typefolio styles well out of the box. For higher-level blog features such as TLDR blocks, GitHub cards, and backlinks, start with [Typefolio Blog Components](/blog/markdown-elements/typefolio-blog-components/).

## Heading hierarchy

### This is a H3 Heading

Example body copy under a third-level heading.

#### This is a H4 Heading

This level works well for shorter subsections inside a technical guide.

## Body copy rhythm

This paragraph sits here as a normal block of reading text so you can judge spacing, measure, and heading transitions inside the default prose styles.


## Horizontal rules

---

text space between horizontal rules

---

---

---

## LaTeX Math

Inline math: $E=mc^2$

Block math:

$$
\int_0^1 x^2\,dx=\frac{1}{3}
$$

## Emphasis

**这是粗体文本**

**This is bold text**

_这是斜体文本_

_This is italic text_

~~这是删除线文本~~

~~Strikethrough~~

<p style="font-weight: 400;">这是normal / This is normal</p>
<p style="font-weight: 600;">这是semibold / This is
semibold</p>
<p style="font-weight: 700;">这是bold / This is bold</p>

## Pangu.js

Typefolio uses `pangu.js` to improve mixed Chinese and English typography automatically.

Without manual spacing, text like `这是 Typefolio 的 typography feature` and `支持 Astro, Markdown, MDX` will render with proper spacing between CJK and Latin text.

你可以直接书写像这样的一段内容：Typefolio支持Markdown、MDX和Astro组件混排，pangu.js会在中文与English单词、数字2026、以及符号API之间自动补上更自然的间距。

## Quotes

"Double quotes" and 'single quotes'

## Blockquotes

> Blockquotes can also be nested...
>
> > ...by using additional greater-than signs right next to each other...

## References

An example containing a clickable reference[^1] with a link to the source.

Second example containing a reference[^2] with a link to the source.

[^1]: Reference first footnote with a return to content link.

[^2]: Second reference with a link.

If you inspect this file in `src/content/blog/markdown-elements/index.md`, you will notice that the references and the heading "Footnotes" are added to the bottom of the page via the [remark-rehype](https://github.com/remarkjs/remark-rehype#options) plugin.

## Lists

Unordered

- Create a list by starting a line with `+`, `-`, or `*`
- Sub-lists are made by indenting 2 spaces:
  - Marker character change forces new list start:
    - Ac tristique libero volutpat at
    - Facilisis in pretium nisl aliquet
    - Nulla volutpat aliquam velit
- Very easy!

Ordered

1. Lorem ipsum dolor sit amet
2. Consectetur adipiscing elit
3. Integer molestie lorem at massa
   1. Lorem ipsum dolor sit amet
   2. Consectetur adipiscing elit
4. You can use sequential numbers...
5. ...or keep all the numbers as `1.`

Start numbering with offset:

57. foo
58. bar

## Code

Inline `code`

Indented code

    // Some comments
    line 1 of code
    line 2 of code
    line 3 of code

Block code "fences"

```
Sample text here...
```

Syntax highlighting

```js
var foo = function (bar) {
	return bar++;
};

console.log(foo(5));
```

### Expressive code examples

Adding a title

```js title="file.js"
console.log("Title example");
```

A bash terminal

```bash
echo "A base terminal example"
```

Highlighting code lines

```js title="line-markers.js" del={2} ins={3-4} {6}
function demo() {
	console.log("this line is marked as deleted");
	// This line and the next one are marked as inserted
	console.log("this is the second inserted line");

	return "this line uses the neutral default marker type";
}
```

[Expressive Code](https://expressive-code.com/) can do a ton more than shown here, and includes a lot of [customisation](https://expressive-code.com/reference/configuration/).

## Tables

| Option | Description                                                               |
| ------ | ------------------------------------------------------------------------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default.    |
| ext    | extension to be used for dest files.                                      |

### Table Alignment

| Item         | Price | # In stock |
| ------------ | :---: | ---------: |
| Juicy Apples | 1.99  |        739 |
| Bananas      | 1.89  |          6 |

### Keyboard elements

| Action                | Shortcut                                   |
| --------------------- | ------------------------------------------ |
| Vertical split        | <kbd>Alt+Shift++</kbd>                     |
| Horizontal split      | <kbd>Alt+Shift+-</kbd>                     |
| Auto split            | <kbd>Alt+Shift+d</kbd>                     |
| Switch between splits | <kbd>Alt</kbd> + arrow keys                |
| Resizing a split      | <kbd>Alt+Shift</kbd> + arrow keys          |
| Close a split         | <kbd>Ctrl+Shift+W</kbd>                    |
| Maximize a pane       | <kbd>Ctrl+Shift+P</kbd> + Toggle pane zoom |

## Images

Image in the same folder: `src/content/blog/markdown-elements/logo.webp`

![Astro theme typefolio logo](./logo.webp)

## Links

[Content from markdown-it](https://markdown-it.github.io/)
