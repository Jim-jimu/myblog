---
title: "Custom Social Cards in Typefolio"
publishDate: "25 March 2025"
description: "An example post for Astro Typefolio, detailing how to add a custom social image card in the frontmatter"
tags: ["example", "blog", "image"]
ogImage: "/social-card.png"
tldr:
  - "You can set `ogImage` in frontmatter to skip auto-generated social cards."
  - "Point `ogImage` to any image path that your site can access."
  - "This post demonstrates a minimal working example."
---

## Adding your own social image to a post

This post is an example of how to add a custom [open graph](https://ogp.me/) social image, also known as an OG image, to a blog post.
By adding the optional ogImage property to the frontmatter of a post, you opt out of [satori](https://github.com/vercel/satori) automatically generating an image for this page.

If you open this markdown file `src/content/blog/social-image.md` you'll see the ogImage property set to an image which lives in the public folder[^1].

```yaml
ogImage: "/social-card.png"
```

You can view the one set for this template page [here](https://astro-typefolio.whliao.me/social-card.png).

[^1]: The image itself can be located anywhere you like.
