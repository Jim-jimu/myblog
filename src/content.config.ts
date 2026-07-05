import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

function removeDupsAndLowerCase(array: string[]) {
	return [...new Set(array.map((str) => str.toLowerCase()))];
}

const titleSchema = z.string().max(60);

const baseSchema = z.object({
	title: titleSchema,
});

const blog = defineCollection({
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			coverImage: z
				.object({
					alt: z.string(),
					src: image(),
				})
				.optional(),
			draft: z.boolean().default(false),
			ogImage: z.string().optional(),
			tldr: z.array(z.string().trim().min(1)).default([]),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			updatedDate: z
				.string()
				.optional()
				.transform((str) => (str ? new Date(str) : undefined)),
			pinned: z.boolean().default(false),
			giscus: z.boolean().default(true),
		}),
});

const tag = defineCollection({
	loader: glob({ base: "./src/content/tag", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: titleSchema.optional(),
		description: z.string().optional(),
	}),
});

const gallery = defineCollection({
	loader: glob({ base: "./src/content/gallery", pattern: "**/index.md" }),
	schema: ({ image }) =>
		baseSchema.extend({
			description: z.string(),
			draft: z.boolean().default(false),
			publishDate: z
				.string()
				.or(z.date())
				.transform((val) => new Date(val)),
			tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
			images: z.array(
				z.object({
					title: titleSchema.optional(),
					src: image(),
					caption: z.string().optional(),
					descPosition: z.enum(["top", "right", "bottom", "left"]).default("bottom"),
				}),
			),
		}),
});

export const collections = { blog, tag, gallery };
