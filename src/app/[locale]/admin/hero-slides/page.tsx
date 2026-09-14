"use client";

import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import styles from "../admin.module.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface HeroSlide {
    id: string;
    eyebrow_tr?: string | null;
    eyebrow_en?: string | null;
    title_tr?: string | null;
    title_en?: string | null;
    desc_tr?: string | null;
    desc_en?: string | null;
    buttonText_tr?: string | null;
    buttonText_en?: string | null;
    buttonUrl?: string | null;
    secondaryButtonText_tr?: string | null;
    secondaryButtonText_en?: string | null;
    secondaryButtonUrl?: string | null;
    imageUrl: string;
    titleSize?: string | null;
    descSize?: string | null;
    showEyebrow?: boolean | null;
    showPrimaryButton?: boolean | null;
    showSecondaryButton?: boolean | null;
    textHorizontal?: string | null;
    textVertical?: string | null;
    cardPosition?: string | null;
    imagePositionX?: number | null;
    imagePositionY?: number | null;
    overlayOpacity?: number | null;
    gridEnabled?: boolean | null;
    gridSize?: number | null;
    gridOpacity?: number | null;
    isActive: boolean;
    isSpecialDay: boolean;
    order: number;
}

type SlideDraft = Partial<HeroSlide>;

type PreviewVars = CSSProperties & {
    "--preview-image-url"?: string;
    "--preview-title-size"?: string;
    "--preview-desc-size"?: string;
};

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["clean"],
    ],
};

const defaultSlideSettings: SlideDraft = {
    imageUrl: "/images/hero_bg.png",
    titleSize: "4rem",
    descSize: "1.25rem",
    showEyebrow: true,
    showPrimaryButton: true,
    showSecondaryButton: true,
    textHorizontal: "left",
    textVertical: "center",
    cardPosition: "right",
    imagePositionX: 50,
    imagePositionY: 50,
    overlayOpacity: 100,
    gridEnabled: true,
    gridSize: 90,
    gridOpacity: 24,
    isActive: true,
    isSpecialDay: false,
    order: 0,
};

const bannerPresets = [
    {
        label: "Servis Hero",
        src: "/images/banners/welab-generated-service-hero.png",
    },
    {
        label: "Ürün Hero",
        src: "/images/banners/welab-generated-products-hero.png",
    },
    {
        label: "Temiz Lab Hero",
        src: "/images/banners/welab-generated-clean-lab-hero.png",
    },
    {
        label: "Analitik Laboratuvar",
        src: "/images/banners/welab-banner-analytical-lab.png",
    },
    {
        label: "Kalite Kontrol",
        src: "/images/banners/welab-banner-quality-control.png",
    },
    {
        label: "Laboratuvar Kurulumu",
        src: "/images/banners/welab-banner-lab-installation.png",
    },
    {
        label: "Ürün Portföyü",
        src: "/images/banners/welab-banner-product-portfolio.png",
    },
];

const slidePresets: Array<{ label: string; data: SlideDraft }> = [
    {
        label: "PeriyotLab Vitrini",
        data: {
            eyebrow_tr: "Endüstriyel laboratuvarlar için güvenilir servis ortağı",
            eyebrow_en: "Trusted service partner for industrial laboratories",
            title_tr: "<p>PERİYOTLAB</p>",
            title_en: "<p>PERIOTLAB</p>",
            desc_tr: "<p>PeriyotLab; servis ve satış hizmetleri için ekonomik, hızlı ve güvenli bir çalışma alanı sunar.</p>",
            desc_en: "<p>PeriyotLab offers an economical, fast and reliable workspace for service and sales operations.</p>",
            buttonText_tr: "Ürünleri İncele",
            buttonText_en: "View Products",
            buttonUrl: "/products",
            secondaryButtonText_tr: "Uzmanla Görüş",
            secondaryButtonText_en: "Talk to an Expert",
            secondaryButtonUrl: "/contact",
            imageUrl: "/images/banners/welab-generated-service-hero.png",
            titleSize: "5.5rem",
            descSize: "1.35rem",
            showEyebrow: true,
            showPrimaryButton: true,
            showSecondaryButton: true,
            textHorizontal: "left",
            textVertical: "center",
            cardPosition: "right",
            imagePositionX: 50,
            imagePositionY: 50,
            overlayOpacity: 100,
            gridEnabled: true,
            gridSize: 90,
            gridOpacity: 24,
            isActive: true,
            isSpecialDay: false,
            order: 0,
        },
    },
    {
        label: "Sadece Görsel",
        data: {
            title_tr: "",
            title_en: "",
            desc_tr: "",
            desc_en: "",
            eyebrow_tr: "",
            eyebrow_en: "",
            buttonText_tr: "",
            buttonText_en: "",
            secondaryButtonText_tr: "",
            secondaryButtonText_en: "",
            showEyebrow: false,
            showPrimaryButton: false,
            showSecondaryButton: false,
            cardPosition: "hidden",
            imageUrl: "/images/banners/welab-generated-clean-lab-hero.png",
            overlayOpacity: 0,
            gridEnabled: false,
        },
    },
    {
        label: "Yazı + Görsel",
        data: {
            title_tr: "<p>Başlığı Buraya Yazın</p>",
            title_en: "<p>Write the Headline Here</p>",
            desc_tr: "<p>Kısa açıklamayı buraya ekleyin.</p>",
            desc_en: "<p>Add a short description here.</p>",
            showEyebrow: false,
            showPrimaryButton: false,
            showSecondaryButton: false,
            cardPosition: "hidden",
            imageUrl: "/images/banners/welab-generated-products-hero.png",
            overlayOpacity: 82,
            gridEnabled: true,
            gridOpacity: 18,
        },
    },
    {
        label: "29 Ekim",
        data: {
            title_tr: "<p>29 Ekim Cumhuriyet Bayramımız</p><p><strong>Kutlu Olsun</strong></p>",
            title_en: "<p>Happy October 29th</p><p><strong>Republic Day</strong></p>",
            desc_tr: "<p>Bilimin, üretimin ve çağdaş geleceğin ışığında Cumhuriyetimizin değerlerini gururla kutluyoruz.</p>",
            desc_en: "<p>We proudly celebrate the values of the Republic through science, production and a modern future.</p>",
            imageUrl: "/images/hero_bg.png",
            isActive: true,
            isSpecialDay: true,
            order: -1,
            titleSize: "4rem",
            descSize: "1.25rem",
        },
    },
    {
        label: "10 Kasım",
        data: {
            title_tr: "<p>Saygı, Özlem ve</p><p><strong>Minnetle</strong></p>",
            title_en: "<p>With Respect and</p><p><strong>Gratitude</strong></p>",
            desc_tr: "<p>Cumhuriyetimizin kurucusu Gazi Mustafa Kemal Atatürk'ü saygı, sevgi ve minnetle anıyoruz.</p>",
            desc_en: "<p>We commemorate Mustafa Kemal Atatürk, founder of the Republic of Türkiye, with respect and gratitude.</p>",
            imageUrl: "/images/hero_bg.png",
            isActive: true,
            isSpecialDay: true,
            order: -1,
            titleSize: "4rem",
            descSize: "1.25rem",
        },
    },
    {
        label: "Bayram",
        data: {
            title_tr: "<p>Ramazan Bayramınız</p><p><strong>Mübarek Olsun</strong></p>",
            title_en: "<p>Eid</p><p><strong>Mubarak</strong></p>",
            desc_tr: "<p>Sağlık, huzur ve mutluluk dolu bir bayram dileriz.</p>",
            desc_en: "<p>Wishing you a peaceful holiday filled with health and happiness.</p>",
            imageUrl: "/images/hero_bg.png",
            isActive: true,
            isSpecialDay: true,
            order: -1,
            titleSize: "4rem",
            descSize: "1.25rem",
        },
    },
];

const stripHtml = (html?: string | null) => {
    return (html || "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/\u00a0/g, " ")
        .trim();
};

const getNumberValue = (value: unknown, fallback: number) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
};

const getSizeNumber = (value: unknown, fallback: number) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return fallback;
    const parsed = Number.parseFloat(value.replace("rem", ""));
    return Number.isFinite(parsed) ? parsed : fallback;
};

const getPreviewTextClass = (position?: string | null) => {
    if (position === "center") return styles.previewTextCenter;
    if (position === "right") return styles.previewTextRight;
    return styles.previewTextLeft;
};

const getPreviewVerticalClass = (position?: string | null) => {
    if (position === "top") return styles.previewVerticalTop;
    if (position === "bottom") return styles.previewVerticalBottom;
    return styles.previewVerticalCenter;
};

export default function AdminHeroSlides() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSlide, setEditingSlide] = useState<SlideDraft | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const draft = editingSlide ? { ...defaultSlideSettings, ...editingSlide } : null;

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const res = await fetch("/api/admin/hero-slides");
            const data = await res.json();
            setSlides(data);
        } catch {
            alert("Slaytlar alınırken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const openEditor = (slide?: SlideDraft) => {
        setEditingSlide({ ...defaultSlideSettings, ...(slide || {}) });
    };

    const updateSlide = (patch: SlideDraft) => {
        setEditingSlide(prev => ({ ...defaultSlideSettings, ...(prev || {}), ...patch }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSlide) return;

        setIsSaving(true);

        const payload = {
            ...defaultSlideSettings,
            ...editingSlide,
            imageUrl: editingSlide.imageUrl || "/images/hero_bg.png",
        };
        const method = editingSlide?.id ? "PATCH" : "POST";
        const url = editingSlide?.id ? `/api/admin/hero-slides/${editingSlide.id}` : "/api/admin/hero-slides";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Slayt başarıyla kaydedildi");
                setEditingSlide(null);
                fetchSlides();
            } else {
                alert("Slayt kaydedilemedi");
            }
        } catch {
            alert("Bir hata oluştu");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu slaytı silmek istediğinize emin misiniz?")) return;

        try {
            const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("Slayt silindi");
                fetchSlides();
            } else {
                alert("Slayt silinemedi");
            }
        } catch {
            alert("Bir hata oluştu");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                updateSlide({ imageUrl: data.url });
                alert("Görsel yüklendi");
            } else {
                alert("Görsel yüklenemedi");
            }
        } catch {
            alert("Yükleme başarısız");
        }
    };

    if (loading) return <div className={styles.loading}>Yükleniyor...</div>;

    const previewImage = draft?.imageUrl || "/images/hero_bg.png";
    const previewTitle = stripHtml(draft?.title_tr);
    const previewDesc = stripHtml(draft?.desc_tr);
    const previewCustomEyebrow = stripHtml(draft?.eyebrow_tr);
    const previewPrimaryButton = stripHtml(draft?.buttonText_tr);
    const previewSecondaryButton = stripHtml(draft?.secondaryButtonText_tr);
    const previewEyebrow = previewCustomEyebrow || "Endüstriyel laboratuvarlar için güvenilir servis ortağı";
    const previewShowEyebrow = draft?.showEyebrow !== false && Boolean(previewCustomEyebrow || previewTitle || previewDesc || previewPrimaryButton || previewSecondaryButton);
    const previewHasText = Boolean(previewTitle || previewDesc || previewShowEyebrow || previewPrimaryButton || previewSecondaryButton);
    const previewShowPrimaryButton = previewHasText && draft?.showPrimaryButton !== false;
    const previewShowSecondaryButton = previewHasText && draft?.showSecondaryButton !== false;
    const previewTitleSize = Math.min(getSizeNumber(draft?.titleSize, 4) * 0.42, 2.35);
    const previewDescSize = Math.min(getSizeNumber(draft?.descSize, 1.25) * 0.7, 1);
    const previewVars: PreviewVars = {
        "--preview-image-url": `url("${previewImage.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}")`,
        "--preview-title-size": `${previewTitleSize}rem`,
        "--preview-desc-size": `${previewDescSize}rem`,
    };

    return (
        <div className={styles.adminContainer}>
            <div className={`${styles.header} ${styles.heroAdminHeader}`}>
                <div>
                    <h1 className={styles.title}>Hero Slider Yönetimi</h1>
                    <p className={styles.heroAdminSubtitle}>
                        Görsel, üst yazı, butonlar, kareli ekran ve kadraj ayarları bu ekrandan yönetilir.
                    </p>
                </div>
                <div className={styles.heroHeaderActions}>
                    <div className={styles.heroPresetBar}>
                        <span>Hazır Şablonlar</span>
                        {slidePresets.map(preset => (
                            <button
                                key={preset.label}
                                className={styles.smallBtn}
                                onClick={() => openEditor(preset.data)}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                    <button
                        className={styles.addButton}
                        onClick={() => openEditor()}
                    >
                        + Yeni Slayt Ekle
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {slides.map(slide => (
                    <div key={slide.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            <Image src={slide.imageUrl} alt="Slayt" fill style={{ objectFit: "cover" }} />
                            {slide.isSpecialDay && <span className={styles.badge}>Özel Gün</span>}
                            {!slide.isActive && <span className={styles.inactiveBadge}>Pasif</span>}
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{stripHtml(slide.title_tr) || "Sadece görsel / başlıksız"}</h3>
                            <div
                                style={{ fontSize: "0.9rem", color: "#555", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                                dangerouslySetInnerHTML={{ __html: slide.desc_tr || "" }}
                            />
                            <div className={styles.cardActions}>
                                <button onClick={() => openEditor(slide)}>Düzenle</button>
                                <button onClick={() => handleDelete(slide.id)} className={styles.deleteBtn}>Sil</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {slides.length === 0 && (
                <div className={styles.heroEmptyState}>
                    Henüz slayt yok. Hazır şablonlardan birini seçebilir ya da yeni slayt ekleyebilirsiniz.
                </div>
            )}

            {draft && (
                <div className={styles.modal}>
                    <div className={`${styles.modalContent} ${styles.heroModalContent}`}>
                        <div className={styles.modalHeader}>
                            <h2>{draft.id ? "Slaytı Düzenle" : "Yeni Slayt"}</h2>
                            <button className={styles.closeBtn} onClick={() => setEditingSlide(null)} type="button">×</button>
                        </div>

                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.heroEditorLayout}>
                                <div className={styles.heroEditorMain}>
                                    <section className={styles.heroEditorSection}>
                                        <h3>Görsel</h3>
                                        <div className={styles.formGroup}>
                                            <label>Görsel URL</label>
                                            <input
                                                type="text"
                                                value={draft.imageUrl || ""}
                                                onChange={e => updateSlide({ imageUrl: e.target.value })}
                                                placeholder="/images/hero_bg.png veya yüklenen görsel URL'i"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Bilgisayardan Görsel Yükle</label>
                                            <input type="file" onChange={handleImageUpload} accept="image/*" />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Hazır Banner Görselleri</label>
                                            <div className={styles.bannerPresetGrid}>
                                                {bannerPresets.map((preset) => (
                                                    <button
                                                        key={preset.src}
                                                        type="button"
                                                        onClick={() => updateSlide({ imageUrl: preset.src })}
                                                        className={`${styles.bannerPresetButton} ${draft.imageUrl === preset.src ? styles.bannerPresetSelected : ""}`}
                                                    >
                                                        <span className={styles.bannerPresetImage}>
                                                            <Image src={preset.src} alt={preset.label} fill style={{ objectFit: "cover" }} />
                                                        </span>
                                                        <span>{preset.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </section>

                                    <section className={styles.heroEditorSection}>
                                        <h3>Üst Yazı</h3>
                                        <div className={styles.checkboxGroup}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={draft.showEyebrow !== false}
                                                    onChange={e => updateSlide({ showEyebrow: e.target.checked })}
                                                />
                                                Küçük etiket görünsün
                                            </label>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Küçük Etiket (TR)</label>
                                                <input
                                                    type="text"
                                                    value={draft.eyebrow_tr || ""}
                                                    onChange={e => updateSlide({ eyebrow_tr: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Küçük Etiket (EN)</label>
                                                <input
                                                    type="text"
                                                    value={draft.eyebrow_en || ""}
                                                    onChange={e => updateSlide({ eyebrow_en: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Başlık (TR)</label>
                                            <ReactQuill
                                                theme="snow"
                                                value={draft.title_tr || ""}
                                                onChange={val => updateSlide({ title_tr: val })}
                                                modules={quillModules}
                                                style={{ backgroundColor: "white" }}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Başlık (EN)</label>
                                            <ReactQuill
                                                theme="snow"
                                                value={draft.title_en || ""}
                                                onChange={val => updateSlide({ title_en: val })}
                                                modules={quillModules}
                                                style={{ backgroundColor: "white" }}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Açıklama (TR)</label>
                                            <ReactQuill
                                                theme="snow"
                                                value={draft.desc_tr || ""}
                                                onChange={val => updateSlide({ desc_tr: val })}
                                                modules={quillModules}
                                                style={{ backgroundColor: "white" }}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Açıklama (EN)</label>
                                            <ReactQuill
                                                theme="snow"
                                                value={draft.desc_en || ""}
                                                onChange={val => updateSlide({ desc_en: val })}
                                                modules={quillModules}
                                                style={{ backgroundColor: "white" }}
                                            />
                                        </div>
                                    </section>

                                    <section className={styles.heroEditorSection}>
                                        <h3>Butonlar</h3>
                                        <div className={styles.checkboxGroup}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={draft.showPrimaryButton !== false}
                                                    onChange={e => updateSlide({ showPrimaryButton: e.target.checked })}
                                                />
                                                Birinci buton görünsün
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={draft.showSecondaryButton !== false}
                                                    onChange={e => updateSlide({ showSecondaryButton: e.target.checked })}
                                                />
                                                İkinci buton görünsün
                                            </label>
                                        </div>
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label>Birinci Buton Yazısı (TR)</label>
                                                <input
                                                    type="text"
                                                    value={draft.buttonText_tr || ""}
                                                    onChange={e => updateSlide({ buttonText_tr: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Birinci Buton Yazısı (EN)</label>
                                                <input
                                                    type="text"
                                                    value={draft.buttonText_en || ""}
                                                    onChange={e => updateSlide({ buttonText_en: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Birinci Buton Linki</label>
                                                <input
                                                    type="text"
                                                    value={draft.buttonUrl || ""}
                                                    onChange={e => updateSlide({ buttonUrl: e.target.value })}
                                                    placeholder="/products"
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>İkinci Buton Yazısı (TR)</label>
                                                <input
                                                    type="text"
                                                    value={draft.secondaryButtonText_tr || ""}
                                                    onChange={e => updateSlide({ secondaryButtonText_tr: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>İkinci Buton Yazısı (EN)</label>
                                                <input
                                                    type="text"
                                                    value={draft.secondaryButtonText_en || ""}
                                                    onChange={e => updateSlide({ secondaryButtonText_en: e.target.value })}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>İkinci Buton Linki</label>
                                                <input
                                                    type="text"
                                                    value={draft.secondaryButtonUrl || ""}
                                                    onChange={e => updateSlide({ secondaryButtonUrl: e.target.value })}
                                                    placeholder="/contact"
                                                />
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <aside className={styles.heroEditorSide}>
                                    <section className={styles.heroEditorSection}>
                                        <h3>Canlı Önizleme</h3>
                                        <div
                                            className={`${styles.heroMiniPreview} ${previewHasText ? "" : styles.heroMiniPreviewImageOnly}`}
                                            style={{
                                                ...previewVars,
                                                backgroundImage: `var(--preview-image-url)`,
                                                backgroundPosition: `${getNumberValue(draft.imagePositionX, 50)}% ${getNumberValue(draft.imagePositionY, 50)}%`,
                                            }}
                                        >
                                            <div className={styles.heroMiniOverlay} style={{ opacity: getNumberValue(draft.overlayOpacity, 100) / 100 }} />
                                            {draft.gridEnabled !== false && (
                                                <div
                                                    className={styles.heroMiniGrid}
                                                    style={{
                                                        backgroundSize: `${getNumberValue(draft.gridSize, 90) * 0.55}px ${getNumberValue(draft.gridSize, 90) * 0.55}px`,
                                                        opacity: getNumberValue(draft.gridOpacity, 24) / 100,
                                                    }}
                                                />
                                            )}
                                            <div
                                                className={`${styles.heroMiniContent} ${getPreviewTextClass(draft.textHorizontal)} ${getPreviewVerticalClass(draft.textVertical)}`}
                                                style={previewVars}
                                            >
                                                {previewShowEyebrow && <span>{previewEyebrow}</span>}
                                                {previewTitle && <div className={styles.heroMiniTitle} dangerouslySetInnerHTML={{ __html: draft.title_tr || "" }} />}
                                                {previewDesc && <div className={styles.heroMiniDescription} dangerouslySetInnerHTML={{ __html: draft.desc_tr || "" }} />}
                                                {(previewShowPrimaryButton || previewShowSecondaryButton) && (
                                                    <div className={styles.heroMiniButtons}>
                                                        {previewShowPrimaryButton && <em>{draft.buttonText_tr || "Ürünleri İncele"}</em>}
                                                        {previewShowSecondaryButton && <em>{draft.secondaryButtonText_tr || "Uzmanla Görüş"}</em>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    <section className={styles.heroEditorSection}>
                                        <h3>Yerleşim</h3>
                                        <div className={styles.formGroup}>
                                            <label>Metin Konumu</label>
                                            <select
                                                value={draft.textHorizontal || "left"}
                                                onChange={e => updateSlide({ textHorizontal: e.target.value })}
                                            >
                                                <option value="left">Sol</option>
                                                <option value="center">Orta</option>
                                                <option value="right">Sağ</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Dikey Konum</label>
                                            <select
                                                value={draft.textVertical || "center"}
                                                onChange={e => updateSlide({ textVertical: e.target.value })}
                                            >
                                                <option value="top">Üst</option>
                                                <option value="center">Orta</option>
                                                <option value="bottom">Alt</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Vitrin Kutusu</label>
                                            <select
                                                value={draft.cardPosition || "right"}
                                                onChange={e => updateSlide({ cardPosition: e.target.value })}
                                            >
                                                <option value="right">Sağda</option>
                                                <option value="left">Solda</option>
                                                <option value="hidden">Gizli</option>
                                            </select>
                                        </div>
                                        <div className={styles.rangeGroup}>
                                            <label>Başlık Boyutu <span>{getSizeNumber(draft.titleSize, 4).toFixed(1)} rem</span></label>
                                            <input
                                                type="range"
                                                min="2.4"
                                                max="6"
                                                step="0.1"
                                                value={getSizeNumber(draft.titleSize, 4)}
                                                onChange={e => updateSlide({ titleSize: `${e.target.value}rem` })}
                                            />
                                        </div>
                                        <div className={styles.rangeGroup}>
                                            <label>Açıklama Boyutu <span>{getSizeNumber(draft.descSize, 1.25).toFixed(1)} rem</span></label>
                                            <input
                                                type="range"
                                                min="0.9"
                                                max="1.8"
                                                step="0.05"
                                                value={getSizeNumber(draft.descSize, 1.25)}
                                                onChange={e => updateSlide({ descSize: `${e.target.value}rem` })}
                                            />
                                        </div>
                                    </section>

                                    <section className={styles.heroEditorSection}>
                                        <h3>Ekran Efekti</h3>
                                        <div className={styles.rangeGroup}>
                                            <label>Görsel Yatay Kadraj <span>{getNumberValue(draft.imagePositionX, 50)}%</span></label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={getNumberValue(draft.imagePositionX, 50)}
                                                onChange={e => updateSlide({ imagePositionX: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.rangeGroup}>
                                            <label>Görsel Dikey Kadraj <span>{getNumberValue(draft.imagePositionY, 50)}%</span></label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={getNumberValue(draft.imagePositionY, 50)}
                                                onChange={e => updateSlide({ imagePositionY: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.rangeGroup}>
                                            <label>Karartma <span>{getNumberValue(draft.overlayOpacity, 100)}%</span></label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={getNumberValue(draft.overlayOpacity, 100)}
                                                onChange={e => updateSlide({ overlayOpacity: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className={styles.checkboxGroup}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={draft.gridEnabled !== false}
                                                    onChange={e => updateSlide({ gridEnabled: e.target.checked })}
                                                />
                                                Kareli ekran görünsün
                                            </label>
                                        </div>
                                        <div className={styles.rangeGroup}>
                                            <label>Kare Boyutu <span>{getNumberValue(draft.gridSize, 90)} px</span></label>
                                            <input
                                                type="range"
                                                min="40"
                                                max="180"
                                                value={getNumberValue(draft.gridSize, 90)}
                                                onChange={e => updateSlide({ gridSize: Number(e.target.value) })}
                                                disabled={draft.gridEnabled === false}
                                            />
                                        </div>
                                        <div className={styles.rangeGroup}>
                                            <label>Kare Belirginliği <span>{getNumberValue(draft.gridOpacity, 24)}%</span></label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={getNumberValue(draft.gridOpacity, 24)}
                                                onChange={e => updateSlide({ gridOpacity: Number(e.target.value) })}
                                                disabled={draft.gridEnabled === false}
                                            />
                                        </div>
                                    </section>

                                    <section className={styles.heroEditorSection}>
                                        <h3>Yayın</h3>
                                        <div className={styles.formGroup}>
                                            <label>Sıralama</label>
                                            <input
                                                type="number"
                                                value={draft.order ?? 0}
                                                onChange={e => updateSlide({ order: Number.parseInt(e.target.value || "0", 10) })}
                                            />
                                        </div>
                                        <div className={styles.checkboxGroup}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={draft.isActive !== false}
                                                    onChange={e => updateSlide({ isActive: e.target.checked })}
                                                />
                                                Aktif
                                            </label>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(draft.isSpecialDay)}
                                                    onChange={e => updateSlide({ isSpecialDay: e.target.checked })}
                                                />
                                                Özel Gün
                                            </label>
                                        </div>
                                    </section>
                                </aside>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setEditingSlide(null)}>İptal</button>
                                <button type="submit" disabled={isSaving}>
                                    {isSaving ? "Kaydediliyor..." : "Slaytı Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
