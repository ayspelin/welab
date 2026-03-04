"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";

export default function SettingsPage() {
    const [aboutText_tr, setAboutTextTr] = useState("");
    const [aboutText_en, setAboutTextEn] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setAboutTextTr(data.aboutText_tr || "");
                        setAboutTextEn(data.aboutText_en || "");
                        setPhone(data.phone || "");
                        setEmail(data.email || "");
                        setAddress(data.address || "");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aboutText_tr, aboutText_en, phone, email, address })
            });

            if (!res.ok) throw new Error("Ayarlar kaydedilemedi.");
            setMessage("Site ayarları başarıyla güncellendi!");
        } catch (error: any) {
            setMessage(error.message || "Bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.adminMain}>
            <div className={styles.header}>
                <h1 className={styles.title}>Site Ayarları & İçerik Yönetimi</h1>
                <p style={{ color: "var(--gray-500)", marginTop: "0.5rem" }}>Hakkımızda yazısı ve iletişim bilgilerini buradan güncelleyebilirsiniz.</p>
            </div>

            <div className={styles.card} style={{ backgroundColor: "white", padding: "2rem", borderRadius: "8px", border: "1px solid var(--gray-200)" }}>
                {message && (
                    <div style={{ padding: "1rem", marginBottom: "1.5rem", borderRadius: "0.25rem", backgroundColor: message.includes("hata") || message.includes("kaydedilemedi") ? "#fee2e2" : "#dcfce7", color: message.includes("hata") || message.includes("kaydedilemedi") ? "#991b1b" : "#166534" }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Hakkımızda Yazısı - Türkçe (HTML formatı desteklenir)</label>
                            <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>HTML etiketleri (`&lt;h2&gt;`, `&lt;p&gt;`, `&lt;strong&gt;` vb.) kullanarak metni şekillendirebilirsiniz.</p>
                            <textarea
                                value={aboutText_tr}
                                onChange={(e) => setAboutTextTr(e.target.value)}
                                rows={10}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Hakkımızda Yazısı - İngilizce (HTML formatı desteklenir)</label>
                            <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>&nbsp;</p>
                            <textarea
                                value={aboutText_en}
                                onChange={(e) => setAboutTextEn(e.target.value)}
                                rows={10}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)", fontFamily: "monospace" }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Telefon Numarası</label>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>E-posta Adresi</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Şirket Adresi</label>
                        <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows={3}
                            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                        />
                    </div>

                    <div style={{ marginTop: "1rem" }}>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "1rem" }}>
                            {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
