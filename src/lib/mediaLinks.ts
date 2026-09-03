export function getYouTubeEmbedUrl(value?: string | null) {
    if (!value) return null;

    try {
        const url = new URL(value);
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
            const embedId = watchId || shortsId;
            return embedId ? `https://www.youtube.com/embed/${embedId}` : null;
        }
    } catch {
        return null;
    }

    return null;
}
