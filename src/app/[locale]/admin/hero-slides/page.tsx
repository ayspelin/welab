"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from "../admin.module.css";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
    titleSize?: string | null;
    descSize?: string | null;
}

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['clean']
    ],
};

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
                alert("Slayt başarıyla kaydedildi");
                setEditingSlide(null);
                fetchSlides();
            } else {
                alert("Slayt kaydedilemedi");
            }
        } catch (error) {
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
        } catch (error) {
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
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setEditingSlide({ ...editingSlide, imageUrl: data.url });
                alert("Görsel yüklendi");
            }
        } catch (error) {
            alert("Yükleme başarısız");
        }
    };
 
    if (loading) return <div className={styles.loading}>Yükleniyor...</div>;

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Hero Slider Yönetimi</h1>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--gray-100)", padding: "0.5rem", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--gray-600)" }}>Hazır Şablonlar:</span>
                        <button 
                            className={styles.smallBtn}
                            onClick={() => setEditingSlide({ 
                                title_tr: "Cumhuriyet Bayramımız Kutlu Olsun!", 
                                title_en: "Happy Republic Day!",
                                desc_tr: "29 Ekim Cumhuriyet Bayramı'nı gururla kutluyoruz.",
                                desc_en: "We proudly celebrate October 29th Republic Day.",
                                isActive: true,
                                isSpecialDay: true,
                                order: -1,
                                titleSize: "4rem",
                                descSize: "1.25rem"
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
                                order: -1,
                                titleSize: "4rem",
                                descSize: "1.25rem"
                            })}
                        >🌙 Bayram</button>
                    </div>
                    <button 
                        className={styles.addButton}
                        onClick={() => setEditingSlide({ isActive: true, order: 0, isSpecialDay: false, titleSize: "4rem", descSize: "1.25rem" })}
                    >
                        + Yeni Slayt Ekle
                    </button>
                </div>
            </div>

            <div className={styles.grid}>
                {slides.map(slide => (
                    <div key={slide.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            <Image src={slide.imageUrl} alt="Slayt" fill style={{ objectFit: 'cover' }} />
                            {slide.isSpecialDay && <span className={styles.badge}>Özel Gün</span>}
                            {!slide.isActive && <span className={styles.inactiveBadge}>Pasif</span>}
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{slide.title_tr || "Başlıksız"}</h3>
                            <p>{slide.desc_tr?.substring(0, 100)}...</p>
                            <div className={styles.cardActions}>
                                <button onClick={() => setEditingSlide(slide)}>Düzenle</button>
                                <button onClick={() => handleDelete(slide.id)} className={styles.deleteBtn}>Sil</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editingSlide && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2>{editingSlide.id ? "Slaytı Düzenle" : "Yeni Slayt"}</h2>
                        <form onSubmit={handleSave} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label>Görsel</label>
                                <input type="file" onChange={handleImageUpload} accept="image/*" />
                                {editingSlide.imageUrl && (
                                    <div className={styles.preview}>
                                        <Image src={editingSlide.imageUrl} alt="Önizleme" width={200} height={100} />
                                    </div>
                                )}
                            </div>
 
                            <div className={styles.formGroup}>
                                <label>Başlık (TR)</label>
                                <ReactQuill 
                                    theme="snow"
                                    value={editingSlide.title_tr || ""} 
                                    onChange={val => setEditingSlide({ ...editingSlide, title_tr: val })}
                                    modules={quillModules}
                                    style={{ backgroundColor: 'white' }}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Başlık (EN)</label>
                                <ReactQuill 
                                    theme="snow"
                                    value={editingSlide.title_en || ""} 
                                    onChange={val => setEditingSlide({ ...editingSlide, title_en: val })}
                                    modules={quillModules}
                                    style={{ backgroundColor: 'white' }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Açıklama (TR)</label>
                                <ReactQuill 
                                    theme="snow"
                                    value={editingSlide.desc_tr || ""} 
                                    onChange={val => setEditingSlide({ ...editingSlide, desc_tr: val })}
                                    modules={quillModules}
                                    style={{ backgroundColor: 'white' }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Açıklama (EN)</label>
                                <ReactQuill 
                                    theme="snow"
                                    value={editingSlide.desc_en || ""} 
                                    onChange={val => setEditingSlide({ ...editingSlide, desc_en: val })}
                                    modules={quillModules}
                                    style={{ backgroundColor: 'white' }}
                                />
                            </div>
 
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Buton Yazısı (TR)</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.buttonText_tr || ""} 
                                        onChange={e => setEditingSlide({ ...editingSlide, buttonText_tr: e.target.value })} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Buton Linki (URL)</label>
                                    <input 
                                        type="text" 
                                        value={editingSlide.buttonUrl || ""} 
                                        onChange={e => setEditingSlide({ ...editingSlide, buttonUrl: e.target.value })} 
                                    />
                                </div>
                            </div>
 
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Sıralama</label>
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
                                        Aktif
                                    </label>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={editingSlide.isSpecialDay} 
                                            onChange={e => setEditingSlide({ ...editingSlide, isSpecialDay: e.target.checked })} 
                                        />
                                        Özel Gün
                                    </label>
                                </div>
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
