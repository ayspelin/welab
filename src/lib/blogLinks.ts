type BlogSlugSource = {
    slug?: string | null;
    title_tr?: string | null;
    title_en?: string | null;
};

const turkishCharacters: Record<string, string> = {
    ğ: "g",
    ü: "u",
    ş: "s",
    ı: "i",
    ö: "o",
    ç: "c",
    Ğ: "g",
    Ü: "u",
    Ş: "s",
    İ: "i",
    Ö: "o",
    Ç: "c",
};

function isExternalUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

function hasUrlCharacters(value: string) {
    return /[/?#.:]/.test(value);
}

export function createBlogSlug(text?: string | null) {
    const normalized = (text || "")
        .split("")
        .map((char) => turkishCharacters[char] || char)
        .join("")
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, " ve ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/--+/g, "-");

    return normalized;
}

export function normalizeBlogSlug(input?: string | null, fallbackTitle?: string | null) {
    const trimmed = (input || "").trim();

    if (trimmed && !isExternalUrl(trimmed) && !hasUrlCharacters(trimmed)) {
        const inputSlug = createBlogSlug(trimmed);
        if (inputSlug) return inputSlug;
    }

    return createBlogSlug(fallbackTitle) || "blog-yazisi";
}

export function getPublicBlogSlug(blog: BlogSlugSource) {
    const storedSlug = (blog.slug || "").trim();

    if (storedSlug && !isExternalUrl(storedSlug) && !hasUrlCharacters(storedSlug)) {
        const cleanSlug = createBlogSlug(storedSlug);
        if (cleanSlug) return cleanSlug;
    }

    return createBlogSlug(blog.title_tr || blog.title_en) || "blog-yazisi";
}

export function getInternalBlogPath(blog: BlogSlugSource) {
    return `/blog/${getPublicBlogSlug(blog)}`;
}
