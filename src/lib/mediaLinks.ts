export function getYouTubeEmbedUrl(value?: string | null) {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const url = new URL(trimmed);
        const hostname = url.hostname.replace(/^www\./, "");

        if (hostname === "youtu.be") {
            const id = url.pathname.split("/").filter(Boolean)[0];
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }

        if (hostname === "youtube.com" || hostname === "m.youtube.com") {
            const watchId = url.searchParams.get("v");
            const shortsId = url.pathname.startsWith("/shorts/")
                ? url.pathname.split("/").filter(Boolean)[1]
                : null;
            const embedIdFromPath = url.pathname.startsWith("/embed/")
                ? url.pathname.split("/").filter(Boolean)[1]
                : null;
            const embedId = watchId || shortsId || embedIdFromPath;
            return embedId ? `https://www.youtube.com/embed/${embedId}` : null;
        }
    } catch {
        const directId = trimmed.match(/^[a-zA-Z0-9_-]{11}$/)?.[0];
        if (directId) return `https://www.youtube.com/embed/${directId}`;

        const normalizedMatch =
            trimmed.match(/youtu-be-([a-zA-Z0-9_-]{11})(?:-|$)/i) ||
            trimmed.match(/youtube-com-(?:watch-v|shorts|embed)-([a-zA-Z0-9_-]{11})(?:-|$)/i);

        return normalizedMatch ? `https://www.youtube.com/embed/${normalizedMatch[1]}` : null;
    }

    return null;
}
