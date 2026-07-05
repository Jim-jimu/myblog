import { type CollectionEntry, getCollection, render } from "astro:content";
import { collectionDateSort } from "@/utils/date";

/** filter out draft posts based on the environment */
export async function getAllPosts(): Promise<CollectionEntry<"blog">[]> {
	return await getCollection("blog", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

let backlinksByPostPromise: Promise<Map<string, CollectionEntry<"blog">[]>> | undefined;

export async function getBacklinksForPost(postId: string): Promise<CollectionEntry<"blog">[]> {
	backlinksByPostPromise ??= createBacklinksByPostMap();
	const backlinksByPost = await backlinksByPostPromise;

	return backlinksByPost.get(postId) ?? [];
}

async function createBacklinksByPostMap(): Promise<Map<string, CollectionEntry<"blog">[]>> {
	const posts = await getAllPosts();
	const postsById = new Map(posts.map((post) => [post.id, post]));
	const backlinksByPost = new Map<string, CollectionEntry<"blog">[]>();

	for (const sourcePost of posts) {
		const { remarkPluginFrontmatter } = await render(sourcePost);
		const outboundPostLinks = new Set<string>(
			((remarkPluginFrontmatter.outboundPostLinks as string[] | undefined) ?? []).filter(Boolean),
		);

		for (const targetPostId of outboundPostLinks) {
			if (targetPostId === sourcePost.id || !postsById.has(targetPostId)) continue;

			const backlinks = backlinksByPost.get(targetPostId) ?? [];
			backlinks.push(sourcePost);
			backlinksByPost.set(targetPostId, backlinks);
		}
	}

	for (const [postId, backlinks] of backlinksByPost) {
		const uniqueBacklinks = [...new Map(backlinks.map((post) => [post.id, post])).values()].sort(
			collectionDateSort,
		);
		backlinksByPost.set(postId, uniqueBacklinks);
	}

	return backlinksByPost;
}

/** Get tag metadata by tag name */
export async function getTagMeta(tag: string): Promise<CollectionEntry<"tag"> | undefined> {
	const tagEntries = await getCollection("tag", (entry) => {
		return entry.id === tag;
	});
	return tagEntries[0];
}

/** groups posts by year (based on option siteConfig.sortPostsByUpdatedDate), using the year as the key
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 */
export function groupPostsByYear(posts: CollectionEntry<"blog">[]) {
	return Object.groupBy(posts, (post) => post.data.publishDate.getFullYear().toString());
}

/** returns all tags created from posts (inc duplicate tags)
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getAllTags(posts: CollectionEntry<"blog">[]) {
	return posts.flatMap((post) => [...post.data.tags]);
}

/** returns all unique tags created from posts
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTags(posts: CollectionEntry<"blog">[]) {
	return [...new Set(getAllTags(posts))];
}

/** returns a count of each unique tag - [[tagName, count], ...]
 *  Note: This function doesn't filter draft posts, pass it the result of getAllPosts above to do so.
 *  */
export function getUniqueTagsWithCount(posts: CollectionEntry<"blog">[]): [string, number][] {
	return [
		...getAllTags(posts).reduce(
			(acc, t) => acc.set(t, (acc.get(t) ?? 0) + 1),
			new Map<string, number>(),
		),
	].sort((a, b) => b[1] - a[1]);
}
