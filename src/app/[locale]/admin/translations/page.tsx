"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import { Link } from "@/i18n/routing";

export default function TranslationsPage() {
    const [translations, setTranslations] = useState<{ tr: any, en: any }>({ tr: {}, en: {} });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeSection, setActiveSection] = useState<string>("Home");

    useEffect(() => {
        fetchTranslations();
    }, []);

    const fetchTranslations = async () => {
        try {
            const res = await fetch("/api/translations");
            if (res.ok) {
                const data = await res.json();
                setTranslations(data);
                if (Object.keys(data.tr).length > 0) {
                    setActiveSection(Object.keys(data.tr)[0]);
                }
            }
        } catch (error) {
            console.error("Failed to fetch translations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const res = await fetch("/api/translations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(translations)
            });

            if (res.ok) {
                setMessage("✅ Metin çevirileri başarıyla güncellendi!");
                setTimeout(() => setMessage(""), 5000);
            } else {
                setMessage("❌ Kaydedilirken bir hata oluştu.");
            }
        } catch (error) {
            setMessage("❌ Bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const handleTextChange = (lang: 'tr' | 'en', section: string, key: string, value: string) => {
        setTranslations(prev => ({
            ...prev,
            [lang]: {
                ...prev[lang],
                [section]: {
                    ...prev[lang]?.[section],
                    [key]: value
                }
            }
        }));
    };

    if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Yükleniyor...</div>;

    const sections = Object.keys(translations.tr || {});

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Site Metinleri & Çeviriler</h1>
                <p style={{ color: "var(--gray-500)", marginTop: "0.5rem" }}>
                    Sitedeki tüm statik yazıları (butonlar, menüler, sabit başlıklar vb.) buradan düzenleyebilir ve değiştirebilirsiniz. <br />
                    Burada yapılan değişiklikler sitenin dil ayarlarında (TR/EN) geçerli olacaktır.
                </p>
            </div>

            {message && (
                <div style={{ padding: "1rem", marginBottom: "1.5rem", borderRadius: "8px", backgroundColor: message.includes("❌") ? "#fee2e2" : "#dcfce7", color: message.includes("❌") ? "#991b1b" : "#166534", fontWeight: "600" }}>
                    {message}
                </div>
            )}

            <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start", position: "relative" }}>
                {/* Sidebar Navigation */}
                <div style={{ width: "250px", backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--gray-200)", position: "sticky", top: "2rem" }}>
                    <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem", color: "var(--gray-800)" }}>Bölümler</h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {sections.map(sec => (
                            <li key={sec}>
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(sec)}
                                    style={{
                                        width: "100%",
                                        textAlign: "left",
                                        padding: "0.75rem 1rem",
                                        borderRadius: "6px",
                                        border: "none",
                                        cursor: "pointer",
                                        fontWeight: activeSection === sec ? "600" : "400",
                                        backgroundColor: activeSection === sec ? "var(--primary)" : "transparent",
                                        color: activeSection === sec ? "white" : "var(--gray-700)",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {sec}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Form Area */}
                <div style={{ flex: 1, backgroundColor: "white", padding: "2rem", borderRadius: "12px", border: "1px solid var(--gray-200)" }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--gray-200)", paddingBottom: "1rem" }}>
                            <h2 style={{ fontSize: "1.5rem", color: "var(--primary)" }}>{activeSection} Bölümü Metinleri</h2>
                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "0.5rem 1.5rem" }}>
                                {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
                            </button>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {activeSection && translations.tr[activeSection] && Object.keys(translations.tr[activeSection]).map((key) => {
                                const trVal = translations.tr[activeSection][key] || "";
                                const enVal = translations.en[activeSection]?.[key] || "";
                                // Use textarea if the text is long, otherwise input
                                const isLong = trVal.length > 60 || enVal.length > 60;

                                return (
                                    <div key={key} style={{ padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--gray-200)", backgroundColor: "var(--gray-50)", display: "flex", flexDirection: "column", gap: "1rem" }}>
                                        <div style={{ fontWeight: "600", color: "var(--gray-800)", fontFamily: "monospace", fontSize: "0.9rem", backgroundColor: "#e2e8f0", padding: "0.25rem 0.5rem", borderRadius: "4px", alignSelf: "flex-start" }}>
                                            Anahtar: {key}
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                                            <div>
                                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>🇹🇷</span> Türkçe
                                                </label>
                                                {isLong ? (
                                                    <textarea 
                                                        value={trVal}
                                                        onChange={(e) => handleTextChange('tr', activeSection, key, e.target.value)}
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontFamily: "inherit", minHeight: "80px" }}
                                                    />
                                                ) : (
                                                    <input 
                                                        type="text"
                                                        value={trVal}
                                                        onChange={(e) => handleTextChange('tr', activeSection, key, e.target.value)}
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>
                                                    <span style={{ fontSize: "1.2rem" }}>🇬🇧</span> İngilizce
                                                </label>
                                                {isLong ? (
                                                    <textarea 
                                                        value={enVal}
                                                        onChange={(e) => handleTextChange('en', activeSection, key, e.target.value)}
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)", fontFamily: "inherit", minHeight: "80px" }}
                                                    />
                                                ) : (
                                                    <input 
                                                        type="text"
                                                        value={enVal}
                                                        onChange={(e) => handleTextChange('en', activeSection, key, e.target.value)}
                                                        style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--gray-300)" }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem" }}>
                            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
                                {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
