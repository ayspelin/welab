"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../admin.module.css";
import RichTextEditor from "@/components/RichTextEditor";
import { createBlogSlug, getPublicBlogSlug } from "@/lib/blogLinks";

interface Blog {
    id: string;
    slug: string;
    title_tr: string;
    title_en?: string | null;
    content_tr: string;
    content_en?: string | null;
    excerpt_tr?: string | null;
    excerpt_en?: string | null;
    coverImage?: string | null;
    seoTitle_tr?: string | null;
    seoTitle_en?: string | null;
    seoDescription_tr?: string | null;
    seoDescription_en?: string | null;
    publishedAt?: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function AdminBlog() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const updateTitle = (title_tr: string) => {
        setEditingBlog((current) => {
            if (!current) return current;

            const oldTitleSlug = createBlogSlug(current.title_tr);
            const shouldUpdateSlug = !current.id || !current.slug || current.slug === oldTitleSlug;

            return {
                ...current,
                title_tr,
                slug: shouldUpdateSlug ? createBlogSlug(title_tr) : current.slug,
            };
        });
    };

    const fetchBlogs = async () => {
        try {
            const res = await fetch("/api/admin/blog");
            const data = await res.json();
            setBlogs(data);
        } catch {
            alert("Bloglar yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const method = editingBlog?.id ? "PUT" : "POST";
        const url = editingBlog?.id ? `/api/admin/blog/${editingBlog.id}` : "/api/admin/blog";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingBlog)
            });

            if (res.ok) {
                alert("Blog başarıyla kaydedildi");
                setEditingBlog(null);
                fetchBlogs();
            } else {
                alert("Blog kaydedilemedi");
            }
        } catch {
            alert("Bir hata oluştu");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu blog yazısını silmek istediğinize emin misiniz?")) return;
 
        try {
            const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("Blog yazısı silindi");
                fetchBlogs();
            } else {
                alert("Blog yazısı silinemedi");
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
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                setEditingBlog({ ...editingBlog, coverImage: data.url });
                alert("Kapak resmi yüklendi");
            }
        } catch {
            alert("Yükleme başarısız");
        }
    };
 
    if (loading) return <div className={styles.loading}>Yükleniyor...</div>;

    return (
        <div className={styles.adminContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Blog Yönetimi</h1>
                <button 
                    className={styles.addButton}
                    onClick={() => setEditingBlog({ 
                        isActive: true, 
                        slug: "", 
                        title_tr: "", 
                        content_tr: "",
                        publishedAt: new Date().toISOString().split('T')[0]
                    })}
                >
                    + Yeni Blog Yazısı
                </button>
            </div>

            <div className={styles.grid}>
                {blogs.map(blog => (
                    <div key={blog.id} className={styles.card}>
                        <div className={styles.cardImage}>
                            {blog.coverImage ? (
                                <Image src={blog.coverImage} alt="Kapak" fill style={{ objectFit: 'cover' }} />
                            ) : (
                                <div style={{ background: "#eee", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>Görsel Yok</div>
                            )}
                            {!blog.isActive && <span className={styles.inactiveBadge}>Pasif</span>}
                        </div>
                        <div className={styles.cardContent}>
                            <h3>{blog.title_tr}</h3>
                            <p>{blog.slug}</p>
                            <p style={{fontSize: '0.8rem', color: '#666'}}>{new Date(blog.createdAt).toLocaleDateString()}</p>
                            <div className={styles.cardActions}>
                                <button onClick={() => {
                                    setEditingBlog({
                                        ...blog,
                                        slug: getPublicBlogSlug(blog),
                                        publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().split('T')[0] : ""
                                    });
                                }}>Düzenle</button>
                                <button onClick={() => handleDelete(blog.id)} className={styles.deleteBtn}>Sil</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editingBlog && (
                <div className={styles.modal} style={{ zIndex: 1000 }}>
                    <div className={styles.modalContent} style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
                        <h2>{editingBlog.id ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}</h2>
                        <form onSubmit={handleSave} className={styles.form}>
                            
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Başlık (TR) *</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={editingBlog.title_tr || ""} 
                                        onChange={e => updateTitle(e.target.value)} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Başlık (EN)</label>
                                    <input 
                                        type="text" 
                                        value={editingBlog.title_en || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, title_en: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Sayfa Adresi *</label>
                                <input 
                                    type="text" 
                                    required
                                    value={editingBlog.slug || ""} 
                                    placeholder="benim-yeni-yazim"
                                    onChange={e => setEditingBlog({ ...editingBlog, slug: createBlogSlug(e.target.value) })} 
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Kapak Resmi</label>
                                <input type="file" onChange={handleImageUpload} accept="image/*" />
                                {editingBlog.coverImage && (
                                    <div className={styles.preview} style={{ marginTop: "10px" }}>
                                        <Image src={editingBlog.coverImage} alt="Önizleme" width={200} height={100} style={{ objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.formGroup}>
                                <label>İçerik (TR) *</label>
                                <RichTextEditor
                                    value={editingBlog.content_tr || ""} 
                                    onChange={val => setEditingBlog({ ...editingBlog, content_tr: val })}
                                    minHeight="360px"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>İçerik (EN)</label>
                                <RichTextEditor
                                    value={editingBlog.content_en || ""} 
                                    onChange={val => setEditingBlog({ ...editingBlog, content_en: val })}
                                    minHeight="360px"
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Özet (TR)</label>
                                    <textarea 
                                        rows={3}
                                        value={editingBlog.excerpt_tr || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, excerpt_tr: e.target.value })} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Özet (EN)</label>
                                    <textarea 
                                        rows={3}
                                        value={editingBlog.excerpt_en || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, excerpt_en: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <h3 style={{ marginTop: "20px", marginBottom: "10px", fontSize: "1.1rem" }}>SEO Ayarları</h3>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>SEO Başlık (TR)</label>
                                    <input 
                                        type="text" 
                                        value={editingBlog.seoTitle_tr || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, seoTitle_tr: e.target.value })} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>SEO Açıklama (TR)</label>
                                    <input 
                                        type="text" 
                                        value={editingBlog.seoDescription_tr || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, seoDescription_tr: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>SEO Başlık (EN)</label>
                                    <input 
                                        type="text" 
                                        value={editingBlog.seoTitle_en || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, seoTitle_en: e.target.value })} 
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>SEO Açıklama (EN)</label>
                                    <input 
                                        type="text" 
                                        value={editingBlog.seoDescription_en || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, seoDescription_en: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className={styles.formRow} style={{ marginTop: "20px" }}>
                                <div className={styles.formGroup}>
                                    <label>Yayın Tarihi</label>
                                    <input 
                                        type="date" 
                                        value={editingBlog.publishedAt || ""} 
                                        onChange={e => setEditingBlog({ ...editingBlog, publishedAt: e.target.value })} 
                                    />
                                </div>
                                <div className={styles.checkboxGroup} style={{ alignSelf: "flex-end", paddingBottom: "10px" }}>
                                    <label>
                                        <input 
                                            type="checkbox" 
                                            checked={editingBlog.isActive} 
                                            onChange={e => setEditingBlog({ ...editingBlog, isActive: e.target.checked })} 
                                        />
                                        Aktif (Yayınla)
                                    </label>
                                </div>
                            </div>
 
                            <div className={styles.modalActions} style={{ marginTop: "30px" }}>
                                <button type="button" onClick={() => setEditingBlog(null)}>İptal</button>
                                <button type="submit" disabled={isSaving}>
                                    {isSaving ? "Kaydediliyor..." : "Kaydet"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
