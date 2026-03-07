"use client";

import { useState, useEffect } from "react";
import styles from "../admin.module.css";
import RichTextEditor from "@/components/RichTextEditor";

export default function SettingsPage() {
    const [aboutText_tr, setAboutTextTr] = useState("");
    const [aboutText_en, setAboutTextEn] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    // New Hero Fields
    const [heroTitle_tr, setHeroTitleTr] = useState("");
    const [heroTitle_en, setHeroTitleEn] = useState("");
    const [heroDesc_tr, setHeroDescTr] = useState("");
    const [heroDesc_en, setHeroDescEn] = useState("");
    const [heroImageUrl, setHeroImageUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [heroBgImageUrl, setHeroBgImageUrl] = useState("");
    const [bgFile, setBgFile] = useState<File | null>(null);
    const [bgPreviewUrl, setBgPreviewUrl] = useState("");

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

                        setHeroTitleTr(data.heroTitle_tr || "");
                        setHeroTitleEn(data.heroTitle_en || "");
                        setHeroDescTr(data.heroDesc_tr || "");
                        setHeroDescEn(data.heroDesc_en || "");
                        setHeroImageUrl(data.heroImageUrl || "");
                        setPreviewUrl(data.heroImageUrl || "");
                        setHeroBgImageUrl(data.heroBgImageUrl || "");
                        setBgPreviewUrl(data.heroBgImageUrl || "");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleBgFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setBgFile(selectedFile);
            setBgPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            let finalImageUrl = heroImageUrl;
            let finalBgImageUrl = heroBgImageUrl;

            // Upload new Image to S3 if file selected
            if (file) {
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Görsel yüklenemedi");
                const uploadData = await uploadRes.json();
                finalImageUrl = uploadData.url;
            }

            // Upload Background Image to S3 if file selected
            if (bgFile) {
                const formData = new FormData();
                formData.append("file", bgFile);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("Arkaplan görseli yüklenemedi");
                const uploadData = await uploadRes.json();
                finalBgImageUrl = uploadData.url;
            }

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    aboutText_tr,
                    aboutText_en,
                    phone,
                    email,
                    address,
                    heroTitle_tr,
                    heroTitle_en,
                    heroDesc_tr,
                    heroDesc_en,
                    heroImageUrl: finalImageUrl,
                    heroBgImageUrl: finalBgImageUrl
                })
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

                    <div style={{ padding: "1.5rem", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--gray-50)" }}>
                        <h3 style={{ marginBottom: "1rem", color: "var(--primary)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "0.5rem" }}>Ana Sayfa Başlıkları (Hero Section)</h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>
                            ✍️ <strong>İpucu:</strong> Ana sayfada mavi/vurgulu görünmesini istediğiniz kelimeleri seçip <strong>Kalın (B)</strong> yapmanız yeterlidir. HTML kodu yazmanıza gerek yoktur.
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "1.5rem" }}>
                            🗑️ <strong>Görsel Silme:</strong> Editöre eklediğiniz bir görseli silmek için <strong>üzerine bir kez tıklayıp klavyenizden Backspace (Silme) veya Delete</strong> tuşuna basabilirsiniz.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Başlık - Türkçe</label>
                                <RichTextEditor
                                    value={heroTitle_tr}
                                    onChange={setHeroTitleTr}
                                    placeholder="Örn: Geleceği Analiz Edin Bilimin Gücüyle"
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Başlık - İngilizce</label>
                                <RichTextEditor
                                    value={heroTitle_en}
                                    onChange={setHeroTitleEn}
                                    placeholder="Örn: Analyze the Future with The Power of Science"
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Açıklama - Türkçe</label>
                                <RichTextEditor
                                    value={heroDesc_tr}
                                    onChange={setHeroDescTr}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Açıklama - İngilizce</label>
                                <RichTextEditor
                                    value={heroDesc_en}
                                    onChange={setHeroDescEn}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Ana Sayfa Görseli (Hero Image)</label>
                            <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "1rem" }}>Ana sayfanın sağ tarafında görünen büyük görseli buradan değiştirebilirsiniz.</p>

                            {previewUrl && (
                                <div style={{ position: "relative", width: "100%", maxWidth: "400px", height: "200px", marginBottom: "1rem", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--gray-200)" }}>
                                    <img src={previewUrl} alt="Hero Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <button
                                        type="button"
                                        onClick={() => { setPreviewUrl(""); setFile(null); setHeroImageUrl(""); }}
                                        style={{ position: "absolute", top: "0.5rem", right: "0.5rem", backgroundColor: "rgba(255,0,0,0.8)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >×</button>
                                </div>
                            )}

                            <label className={styles.fileUploadBtn}>
                                <span>Görsel Seç</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>

                        {/* Background Image Uploader */}
                        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--gray-200)", paddingTop: "1.5rem" }}>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Ana Sayfa Arkaplan Görseli (Blur & Background Image)</label>
                            <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", marginBottom: "1rem" }}>Ana sayfanın arkasında flulaştırılmış (blur) şekilde görünen tam ekran arkaplan görselini buradan değiştirebilirsiniz.</p>

                            {bgPreviewUrl && (
                                <div style={{ position: "relative", width: "100%", maxWidth: "400px", height: "200px", marginBottom: "1rem", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--gray-200)" }}>
                                    <img src={bgPreviewUrl} alt="Hero Background Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <button
                                        type="button"
                                        onClick={() => { setBgPreviewUrl(""); setBgFile(null); setHeroBgImageUrl(""); }}
                                        style={{ position: "absolute", top: "0.5rem", right: "0.5rem", backgroundColor: "rgba(255,0,0,0.8)", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                    >×</button>
                                </div>
                            )}

                            <label className={styles.fileUploadBtn}>
                                <span>Arkaplan Görseli Seç</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBgFileChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Hakkımızda Yazısı - Türkçe</label>
                            <RichTextEditor
                                value={aboutText_tr}
                                onChange={setAboutTextTr}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Hakkımızda Yazısı - İngilizce</label>
                            <RichTextEditor
                                value={aboutText_en}
                                onChange={setAboutTextEn}
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
