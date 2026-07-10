"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");
const vscode = require("vscode");
const DEFAULT_DEV_COMMAND = "if command -v pnpm >/dev/null 2>&1; then pnpm dev -- --host 127.0.0.1; else npm run dev -- --host 127.0.0.1; fi";
function activate(context) {
    const controller = new TypefolioPreviewController();
    context.subscriptions.push(controller);
}
function deactivate() { }
class TypefolioPreviewController {
    currentTarget;
    panel;
    terminal;
    disposables = [];
    constructor() {
        this.disposables.push(vscode.commands.registerCommand("typefolioPreview.openPreview", () => this.openPreview()), vscode.commands.registerCommand("typefolioPreview.refreshPreview", () => this.refreshPreview()), vscode.commands.registerCommand("typefolioPreview.startDevServer", () => this.startDevServer()), vscode.commands.registerCommand("typefolioPreview.openInBrowser", () => this.openInBrowser()), vscode.window.onDidChangeActiveTextEditor((editor) => this.handleActiveEditorChange(editor)), vscode.workspace.onDidSaveTextDocument((document) => this.handleDocumentSave(document)), vscode.workspace.onDidChangeTextDocument((event) => this.handleDocumentChange(event.document)));
    }
    dispose() {
        for (const disposable of this.disposables)
            disposable.dispose();
        this.panel?.dispose();
    }
    async openPreview() {
        const target = this.resolveActiveTarget();
        if (!target) {
            vscode.window.showWarningMessage("Open a Markdown or MDX file under src/content/blog first.");
            return;
        }
        this.currentTarget = target;
        this.ensurePanel();
        await this.renderCurrentTarget();
    }
    async refreshPreview() {
        const activeTarget = this.resolveActiveTarget();
        if (activeTarget)
            this.currentTarget = activeTarget;
        if (!this.currentTarget) {
            await this.openPreview();
            return;
        }
        const config = getPreviewConfig(this.currentTarget.workspaceFolder);
        const document = await vscode.workspace.openTextDocument(this.currentTarget.documentUri);
        if (config.saveBeforeRefresh && document.isDirty)
            await document.save();
        this.ensurePanel();
        await this.renderCurrentTarget();
    }
    async startDevServer() {
        const workspaceFolder = this.currentTarget?.workspaceFolder ?? vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showWarningMessage("Open the blog workspace before starting Astro.");
            return;
        }
        const config = getPreviewConfig(workspaceFolder);
        this.terminal ??= vscode.window.createTerminal({
            cwd: workspaceFolder.uri.fsPath,
            name: "Typefolio Astro Dev Server",
        });
        this.terminal.show();
        this.terminal.sendText(config.devCommand);
        if (this.currentTarget) {
            this.panel?.webview.postMessage({
                command: "setStatus",
                message: "Starting Astro dev server...",
            });
            await waitForRoute(this.currentTarget.route, 15_000);
            await this.renderCurrentTarget();
        }
    }
    async openInBrowser() {
        const activeTarget = this.resolveActiveTarget();
        if (activeTarget)
            this.currentTarget = activeTarget;
        if (!this.currentTarget) {
            await this.openPreview();
            return;
        }
        await vscode.env.openExternal(vscode.Uri.parse(this.currentTarget.route));
    }
    async handleActiveEditorChange(editor) {
        if (!this.panel || !editor)
            return;
        const target = this.resolveTarget(editor.document);
        if (!target)
            return;
        if (this.currentTarget?.documentUri.toString() === target.documentUri.toString())
            return;
        this.currentTarget = target;
        await this.renderCurrentTarget();
    }
    async handleDocumentSave(document) {
        if (!this.panel || !this.currentTarget)
            return;
        if (document.uri.toString() !== this.currentTarget.documentUri.toString())
            return;
        const config = getPreviewConfig(this.currentTarget.workspaceFolder);
        if (!config.previewOnSave)
            return;
        await this.renderCurrentTarget();
    }
    handleDocumentChange(document) {
        if (!this.panel || !this.currentTarget)
            return;
        if (document.uri.toString() !== this.currentTarget.documentUri.toString())
            return;
        this.panel.webview.postMessage({
            command: "setDirty",
            dirty: document.isDirty,
        });
    }
    ensurePanel() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }
        this.panel = vscode.window.createWebviewPanel("typefolioBlogPreview", "Typefolio Preview", vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
        this.panel.webview.onDidReceiveMessage((message) => {
            if (message.command === "refresh")
                void this.refreshPreview();
            if (message.command === "start")
                void this.startDevServer();
            if (message.command === "openExternal")
                void this.openInBrowser();
        });
    }
    async renderCurrentTarget() {
        if (!this.panel || !this.currentTarget)
            return;
        const document = await vscode.workspace.openTextDocument(this.currentTarget.documentUri);
        const serverStatus = await checkRoute(this.currentTarget.route);
        this.panel.title = `Preview: ${this.currentTarget.title}`;
        this.panel.webview.html = renderWebviewHtml(this.panel.webview, this.currentTarget, serverStatus, document.isDirty);
    }
    resolveActiveTarget() {
        const document = vscode.window.activeTextEditor?.document;
        return document ? this.resolveTarget(document) : undefined;
    }
    resolveTarget(document) {
        if (document.uri.scheme !== "file")
            return undefined;
        const extension = path.extname(document.uri.fsPath).toLowerCase();
        if (extension !== ".md" && extension !== ".mdx")
            return undefined;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder)
            return undefined;
        const config = getPreviewConfig(workspaceFolder);
        const blogRoot = path.resolve(workspaceFolder.uri.fsPath, config.blogContentRoot);
        const relative = path.relative(blogRoot, document.uri.fsPath);
        if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
            return undefined;
        const postId = postIdFromRelativePath(toPosix(relative));
        if (!postId)
            return undefined;
        return {
            documentUri: document.uri,
            postId,
            route: buildPostRoute(config, postId),
            title: postId,
            workspaceFolder,
        };
    }
}
function getPreviewConfig(workspaceFolder) {
    const config = vscode.workspace.getConfiguration("typefolioPreview", workspaceFolder.uri);
    return {
        basePath: normalizeBasePath(config.get("basePath", "/myblog")),
        blogContentRoot: normalizeRelativePath(config.get("blogContentRoot", "src/content/blog")),
        devCommand: config.get("devCommand", DEFAULT_DEV_COMMAND),
        previewOnSave: config.get("previewOnSave", true),
        saveBeforeRefresh: config.get("saveBeforeRefresh", false),
        serverUrl: normalizeServerUrl(config.get("serverUrl", "http://localhost:4321")),
    };
}
function postIdFromRelativePath(relativePath) {
    const withoutExtension = relativePath.replace(/\.(md|mdx)$/i, "");
    let postId = withoutExtension;
    if (path.posix.basename(withoutExtension) === "index") {
        postId = path.posix.dirname(withoutExtension);
    }
    if (postId === ".")
        return "";
    // Astro's glob loader generates lowercase GitHub-style slugs from entry paths.
    return postId
        .split("/")
        .map((segment) => segment.toLowerCase().replaceAll(" ", "-"))
        .join("/");
}
function buildPostRoute(config, postId) {
    const encodedPostId = postId
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
    return `${config.serverUrl}${config.basePath}/blog/${encodedPostId}/`;
}
async function checkRoute(route) {
    const statusCode = await requestStatusCode(route);
    if (statusCode === undefined) {
        return {
            message: "Astro dev server is not reachable.",
            ok: false,
        };
    }
    if (statusCode >= 200 && statusCode < 400) {
        return {
            message: "Preview is using the live Astro route.",
            ok: true,
            statusCode,
        };
    }
    return {
        message: `Astro returned HTTP ${statusCode}. Save the post and check frontmatter/schema errors in the dev server terminal.`,
        ok: false,
        statusCode,
    };
}
async function waitForRoute(route, timeoutMs) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        const status = await requestStatusCode(route);
        if (status && status >= 200 && status < 500)
            return;
        await delay(750);
    }
}
function requestStatusCode(route) {
    return new Promise((resolve) => {
        const url = new URL(route);
        const client = url.protocol === "https:" ? https : http;
        const request = client.request(url, {
            method: "GET",
            timeout: 2_500,
        }, (response) => {
            response.resume();
            resolve(response.statusCode);
        });
        request.on("timeout", () => {
            request.destroy();
            resolve(undefined);
        });
        request.on("error", () => resolve(undefined));
        request.end();
    });
}
function renderWebviewHtml(webview, target, status, isDirty) {
    const nonce = getNonce();
    const routeWithRefresh = `${target.route}?typefolioPreview=${Date.now()}`;
    const frameSource = getFrameSource(target.route);
    const body = status.ok
        ? `<iframe title="Blog preview" src="${escapeHtml(routeWithRefresh)}"></iframe>`
        : `<main class="empty">
				<h1>Preview unavailable</h1>
				<p>${escapeHtml(status.message)}</p>
				<div class="actions">
					<button data-command="start">Start Astro</button>
					<button data-command="refresh">Retry</button>
				</div>
			</main>`;
    return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src ${frameSource}; img-src ${frameSource} https: data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
	<title>Typefolio Preview</title>
	<style>
		:root {
			color-scheme: light dark;
			--border: color-mix(in srgb, currentColor 18%, transparent);
			--muted: color-mix(in srgb, currentColor 68%, transparent);
			--surface: color-mix(in srgb, Canvas 96%, CanvasText 4%);
		}
		* {
			box-sizing: border-box;
		}
		body {
			background: Canvas;
			color: CanvasText;
			display: grid;
			font: 13px/1.4 var(--vscode-font-family);
			grid-template-rows: auto 1fr;
			height: 100vh;
			margin: 0;
		}
		header {
			align-items: center;
			border-bottom: 1px solid var(--border);
			display: grid;
			gap: 10px;
			grid-template-columns: minmax(0, 1fr) auto;
			min-height: 48px;
			padding: 8px 10px;
		}
		.title {
			font-weight: 600;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.meta {
			color: var(--muted);
			font-size: 12px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.actions {
			display: flex;
			gap: 8px;
		}
		button {
			background: var(--vscode-button-background);
			border: 1px solid transparent;
			border-radius: 4px;
			color: var(--vscode-button-foreground);
			cursor: pointer;
			font: inherit;
			padding: 5px 10px;
		}
		button.secondary {
			background: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}
		.status {
			color: ${status.ok ? "var(--muted)" : "var(--vscode-errorForeground)"};
		}
		.dirty {
			color: var(--vscode-editorWarning-foreground);
			display: ${isDirty ? "inline" : "none"};
		}
		iframe {
			border: 0;
			height: 100%;
			width: 100%;
		}
		.empty {
			align-content: center;
			display: grid;
			gap: 12px;
			justify-items: center;
			padding: 24px;
			text-align: center;
		}
		.empty h1 {
			font-size: 18px;
			margin: 0;
		}
		.empty p {
			color: var(--muted);
			margin: 0;
			max-width: 520px;
		}
	</style>
</head>
<body>
	<header>
		<div>
			<div class="title">${escapeHtml(target.postId)}</div>
			<div class="meta">
				<span class="status">${escapeHtml(status.message)}</span>
				<span class="dirty" id="dirty"> Unsaved changes: save to update preview.</span>
				<br>
				${escapeHtml(target.route)}
			</div>
		</div>
		<div class="actions">
			<button class="secondary" data-command="start">Start Astro</button>
			<button class="secondary" data-command="openExternal">Browser</button>
			<button data-command="refresh">Refresh</button>
		</div>
	</header>
	${body}
	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		for (const button of document.querySelectorAll("button[data-command]")) {
			button.addEventListener("click", () => {
				vscode.postMessage({ command: button.dataset.command });
			});
		}
		window.addEventListener("message", (event) => {
			if (event.data?.command === "setDirty") {
				const dirty = document.getElementById("dirty");
				if (dirty) dirty.style.display = event.data.dirty ? "inline" : "none";
			}
			if (event.data?.command === "setStatus") {
				const status = document.querySelector(".status");
				if (status) status.textContent = event.data.message;
			}
		});
	</script>
</body>
</html>`;
}
function getFrameSource(route) {
    const origin = new URL(route).origin;
    return `${origin} http://localhost:* http://127.0.0.1:*`;
}
function normalizeServerUrl(url) {
    return url.trim().replace(/\/+$/g, "");
}
function normalizeBasePath(basePath) {
    const trimmed = basePath.trim();
    if (!trimmed || trimmed === "/")
        return "";
    return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}
function normalizeRelativePath(relativePath) {
    return toPosix(relativePath).replace(/^\/+|\/+$/g, "");
}
function toPosix(filePath) {
    return filePath.split(path.sep).join(path.posix.sep);
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}
function getNonce() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let nonce = "";
    for (let i = 0; i < 32; i += 1) {
        nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
}
