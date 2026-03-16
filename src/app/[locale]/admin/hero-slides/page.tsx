"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "../admin.module.css";

interface HeroSlide {
    id: string;
    title_tr?: string | null;
    title_en?: string | null;
    desc_tr?: string | null;
    desc_en?: string | null;
    buttonText_tr?: string | null;
    buttonText_en?: string | null;
    buttonUrl?: string | null;
    imageUrl: string;
    isActive: boolean;
    isSpecialDay: boolean;
    order: number;
}

export default function AdminHeroSlides() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const res = await fetch("/api/admin/hero-slides");
            const data = await res.json();
            setSlides(data);
        } catch (error) {
            alert("An error occurred while fetching slides");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const method = editingSlide?.id ? "PATCH" : "POST";
        const url = editingSlide?.id ? `/api/admin/hero-slides/${editingSlide.id}` : "/api/admin/hero-slides";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingSlide)
            });

            if (res.ok) {
                alert("Slide saved successfully");
                setEditingSlide(null);
                fetchSlides();
            } else {
                alert("Failed to save slide");
            }
        } catch (error) {
            alert("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this slide?")) return;

        try {
            const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("Slide deleted");
                fetchSlides();
            } else {
                alert("Failed to delete slide");
            }
        } catch (error) {
            alert("An error occurred");
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
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setEditingSlide({ ...editingSlide, imageUrl: data.url });
                alert("Image uploaded");
            }
        } catch (error) {
            alert("Upload failed");
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Hero Slider Management</h1>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--gray-100)", padding: "0.5rem", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--gray-600)" }}>Presets:</span>
                        <button 
                            className={styles.smallBtn}
                            onClick={() => setEditingSlide({ 
                                title_tr: "Cumhuriyet Bayramımız Kutlu Olsun!", 
                                title_en: "Happy Republic Day!",
                                desc_tr: "29 Ekim Cumhuriyet Bayramı'nı gururla kutluyoruz.",
                                desc_en: "We proudly celebrate October 29th Republic Day.",
                                isActive: true,
                                isSpecialDay: true,
                                order: -1
                            })}
                        >🇹🇷 29 Ekim</button>
                        <button 
                            className={styles.smallBtn}
                            onClick={() => setEditingSlide({ 
                                title_tr: "Ramazan Bayramınız Mübarek Olsun", 
                                title_en: "Eid Mubarak",
                                desc_tr: "Tüm İslam aleminin bayramını kutlarız.",
                                desc_en: "Happy Eid to all the Islamic world.",
                                isActive: true,
                                isSpecialDay: true,
                                order: -1
                            })}
                        >🌙 Bayram</button>
                    </div>
                    <button 
                        className={styles.addButton}
                        onClick={() => setEditingSlide({ isActive: true, order: 0, isSpecialDay: false })}
                    >
                        + Add New Slide
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {slides.map(slide => (
                    <div key={slide.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            <Image src={slide.imageUrl} alt="Slide" fill style={{ objectFit: 'cover' }} />
                            {slide.isSpecialDay && <span className={styles.badge}>Special Day</span>}
                            {!slide.isActive && <span className={styles.inactiveBadge}>Inactive</span>}
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{slide.title_tr || "No Title"}</h3>
                            <p>{slide.desc_tr?.substring(0, 100)}...</p>
                            <div className={styles.cardActions}>
                                <button onClick={() => setEditingSlide(slide)}>Edit</button>
                                <button onClick={() => handleDelete(slide.id)} className={styles.deleteBtn}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editingSlide && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>{editingSlide.id ? "Edit Slide" : "New Slide"}</h2>
                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Image</label>
                                <input type="file" onChange={handleImageUpload} accept="image/*" />
                                {editingSlide.imageUrl && (
                                    <div className={styles.preview}>
                                        <Image src={editingSlide.imageUrl} alt="Preview" width={200} height={100} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Title (TR)</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.title_tr || ""} 
                                        onChange={e => setEditingSlide({ ...editingSlide, title_tr: e.target.value })} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Title (EN)</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.title_en || ""} 
                                        onChange={e => setEditingSlide({ ...editingSlide, title_en: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description (TR)</label>
                                <textarea 
                                    value={editingSlide.desc_tr || ""} 
                                    onChange={e => setEditingSlide({ ...editingSlide, desc_tr: e.target.value })} 
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Description (EN)</label>
                                <textarea 
                                    value={editingSlide.desc_en || ""} 
                                    onChange={e => setEditingSlide({ ...editingSlide, desc_en: e.target.value })} 
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Button Text (TR)</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.buttonText_tr || ""} 
                                        onChange={e => setEditingSlide({ ...editingSlide, buttonText_tr: e.target.value })} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Button URL</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.buttonUrl || ""} 
                                        onChange={e => setEditingSlide({ ...editingSlide, buttonUrl: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Order</label>
                                    <input 
                                        type="number" 
                                        value={editingSlide.order} 
                                        onChange={e => setEditingSlide({ ...editingSlide, order: parseInt(e.target.value) })} 
                                    />
                                </div>
                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={editingSlide.isActive} 
                                            onChange={e => setEditingSlide({ ...editingSlide, isActive: e.target.checked })} 
                                        />
                                        Active
                                    </label>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={editingSlide.isSpecialDay} 
                                            onChange={e => setEditingSlide({ ...editingSlide, isSpecialDay: e.target.checked })} 
                                        />
                                        Special Day
                                    </label>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setEditingSlide(null)}>Cancel</button>
                                <button type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Slide"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
