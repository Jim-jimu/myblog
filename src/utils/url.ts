const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string) {
	if (/^(?:[a-z][a-z\d+\-.]*:|\/\/|#)/i.test(path)) return path;

	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${basePath}${normalizedPath}`;
}
