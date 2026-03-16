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

    const [refNotice_tr, setRefNoticeTr] = useState("");
    const [refNotice_en, setRefNoticeEn] = useState("");

    // New Trust & Stats fields
    const [trustFeatures_tr, setTrustFeaturesTr] = useState<string[]>(["", "", "", ""]);
    const [trustFeatures_en, setTrustFeaturesEn] = useState<string[]>(["", "", "", ""]);
    const [trustStats_tr, setTrustStatsTr] = useState<{ number: string, label: string }[]>([
        { number: "", label: "" }, { number: "", label: "" }, { number: "", label: "" }, { number: "", label: "" }
    ]);
    const [trustStats_en, setTrustStatsEn] = useState<{ number: string, label: string }[]>([
        { number: "", label: "" }, { number: "", label: "" }, { number: "", label: "" }, { number: "", label: "" }
    ]);

    // Footer & Social fields
    const [footerDesc_tr, setFooterDescTr] = useState("");
    const [footerDesc_en, setFooterDescEn] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [footerQuickLinks, setFooterQuickLinks] = useState("");
    const [footerColumns, setFooterColumns] = useState<any[]>([]);

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
                        setRefNoticeTr(data.refNotice_tr || "");
                        setRefNoticeEn(data.refNotice_en || "");

                        if (data.trustFeatures_tr && Array.isArray(data.trustFeatures_tr)) setTrustFeaturesTr(data.trustFeatures_tr);
                        if (data.trustFeatures_en && Array.isArray(data.trustFeatures_en)) setTrustFeaturesEn(data.trustFeatures_en);
                        if (data.trustStats_tr && Array.isArray(data.trustStats_tr)) setTrustStatsTr(data.trustStats_tr);
                        if (data.trustStats_en && Array.isArray(data.trustStats_en)) setTrustStatsEn(data.trustStats_en);

                        setFooterDescTr(data.footerDesc_tr || "");
                        setFooterDescEn(data.footerDesc_en || "");
                        setInstagramUrl(data.instagramUrl || "");
                        setLinkedinUrl(data.linkedinUrl || "");
                        setTwitterUrl(data.twitterUrl || "");
                        setYoutubeUrl(data.youtubeUrl || "");
                        setFooterQuickLinks(data.footerQuickLinks || "");
                        if (data.footerColumns) {
                            setFooterColumns(typeof data.footerColumns === 'string' ? JSON.parse(data.footerColumns) : data.footerColumns);
                        } else {
                            // Default columns if none exist
                            setFooterColumns([
                                { title_tr: "Hızlı Bağlantılar", title_en: "Quick Links", links: [{ label_tr: "Hakkımızda", label_en: "About", href: "/about" }] },
                                { title_tr: "Ürünler ve Çözümler", title_en: "Products & Solutions", links: [{ label_tr: "Analitik Cihazlar", label_en: "Analytical", href: "/products?category=c1" }] }
                            ]);
                        }
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
                    heroBgImageUrl: finalBgImageUrl,
                    refNotice_tr,
                    refNotice_en,
                    trustFeatures_tr,
                    trustFeatures_en,
                    trustStats_tr,
                    trustStats_en,
                    footerDesc_tr,
                    footerDesc_en,
                    instagramUrl,
                    linkedinUrl,
                    twitterUrl,
                    youtubeUrl,
                    footerQuickLinks,
                    footerColumns,
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

                    {/* References Coming Soon Notice */}
                    <div style={{ padding: "1.5rem", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--gray-50)" }}>
                        <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "0.5rem" }}>Referanslar Sayfası Bildirimi</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginBottom: "1.25rem" }}>
                            Referanslar sayfasında gösterilecek bildirim metni (ör. &quot;Referanslarımız yakında yüklenecektir&quot;). Boş bırakılırsa bildirim gösterilmez.
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Bildirim - Türkçe</label>
                                <textarea
                                    value={refNotice_tr}
                                    onChange={(e) => setRefNoticeTr(e.target.value)}
                                    rows={3}
                                    placeholder="Örn: Referanslarımız yakında yüklenecektir."
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)", fontFamily: "inherit" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Bildirim - İngilizce</label>
                                <textarea
                                    value={refNotice_en}
                                    onChange={(e) => setRefNoticeEn(e.target.value)}
                                    rows={3}
                                    placeholder="Örn: Our references will be uploaded soon."
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)", fontFamily: "inherit" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trust & Stats Section */}
                    <div style={{ padding: "1.5rem", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--gray-50)" }}>
                        <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "0.5rem" }}>Ana Sayfa İstatistikler ve Özellikler (Why Choose Us)</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginBottom: "1.25rem" }}>
                            Ana sayfadaki &quot;Neden Bizi Seçmelisiniz?&quot; bölümünü buradan düzenleyebilirsiniz. 4 adet özellik ve 4 adet istatistik ekleyebilirsiniz.
                        </p>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
                            {/* Features TR/EN */}
                            <div>
                                <h4 style={{ marginBottom: "1rem", color: "var(--gray-700)" }}>Özellikler - Türkçe</h4>
                                {trustFeatures_tr.map((feature, i) => (
                                    <div key={`feat-tr-${i}`} style={{ marginBottom: "0.5rem" }}>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => {
                                                const newFeats = [...trustFeatures_tr];
                                                newFeats[i] = e.target.value;
                                                setTrustFeaturesTr(newFeats);
                                            }}
                                            placeholder={`${i + 1}. Özellik (Örn: Yetkili Türkiye Distribütörü)`}
                                            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h4 style={{ marginBottom: "1rem", color: "var(--gray-700)" }}>Özellikler - İngilizce</h4>
                                {trustFeatures_en.map((feature, i) => (
                                    <div key={`feat-en-${i}`} style={{ marginBottom: "0.5rem" }}>
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => {
                                                const newFeats = [...trustFeatures_en];
                                                newFeats[i] = e.target.value;
                                                setTrustFeaturesEn(newFeats);
                                            }}
                                            placeholder={`${i + 1}. Feature (e.g: Authorized Global Distributor)`}
                                            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                            {/* Stats TR */}
                            <div>
                                <h4 style={{ marginBottom: "1rem", color: "var(--gray-700)" }}>İstatistikler (Sayı & Etiket) - Türkçe</h4>
                                {trustStats_tr.map((stat, i) => (
                                    <div key={`stat-tr-${i}`} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                        <input
                                            type="text"
                                            value={stat.number}
                                            onChange={(e) => {
                                                const newStats = [...trustStats_tr];
                                                newStats[i].number = e.target.value;
                                                setTrustStatsTr(newStats);
                                            }}
                                            placeholder="Sayı (Örn: 15+)"
                                            style={{ width: "80px", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                        />
                                        <input
                                            type="text"
                                            value={stat.label}
                                            onChange={(e) => {
                                                const newStats = [...trustStats_tr];
                                                newStats[i].label = e.target.value;
                                                setTrustStatsTr(newStats);
                                            }}
                                            placeholder="Metin (Örn: Yıllık Tecrübe)"
                                            style={{ flex: 1, padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {/* Stats EN */}
                            <div>
                                <h4 style={{ marginBottom: "1rem", color: "var(--gray-700)" }}>İstatistikler (Number & Label) - İngilizce</h4>
                                {trustStats_en.map((stat, i) => (
                                    <div key={`stat-en-${i}`} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                        <input
                                            type="text"
                                            value={stat.number}
                                            onChange={(e) => {
                                                const newStats = [...trustStats_en];
                                                newStats[i].number = e.target.value;
                                                setTrustStatsEn(newStats);
                                            }}
                                            placeholder="Number (e.g: 15+)"
                                            style={{ width: "80px", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                        />
                                        <input
                                            type="text"
                                            value={stat.label}
                                            onChange={(e) => {
                                                const newStats = [...trustStats_en];
                                                newStats[i].label = e.target.value;
                                                setTrustStatsEn(newStats);
                                            }}
                                            placeholder="Label (e.g: Years of Experience)"
                                            style={{ flex: 1, padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid var(--gray-300)" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Links Management */}
                    <div style={{ padding: "1.5rem", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--gray-50)" }}>
                        <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "0.5rem" }}>Alt Bilgi (Footer) Linkleri</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginBottom: "1.25rem" }}>
                            Alt bilgideki link sütunlarını ve linkleri buradan yönetebilirsiniz.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                            {footerColumns.map((col, colIndex) => (
                                <div key={colIndex} style={{ padding: "1rem", border: "1px solid var(--gray-300)", borderRadius: "8px", backgroundColor: "white" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                        <div style={{ display: "flex", gap: "1rem", flex: 1 }}>
                                            <input 
                                                type="text" 
                                                value={col.title_tr} 
                                                onChange={(e) => {
                                                    const newCols = [...footerColumns];
                                                    newCols[colIndex].title_tr = e.target.value;
                                                    setFooterColumns(newCols);
                                                }}
                                                placeholder="Sütun Başlığı (TR)" 
                                                style={{ padding: "0.5rem", border: "1px solid var(--gray-300)", borderRadius: "4px", flex: 1 }}
                                            />
                                            <input 
                                                type="text" 
                                                value={col.title_en} 
                                                onChange={(e) => {
                                                    const newCols = [...footerColumns];
                                                    newCols[colIndex].title_en = e.target.value;
                                                    setFooterColumns(newCols);
                                                }}
                                                placeholder="Sütun Başlığı (EN)" 
                                                style={{ padding: "0.5rem", border: "1px solid var(--gray-300)", borderRadius: "4px", flex: 1 }}
                                            />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newCols = footerColumns.filter((_, i) => i !== colIndex);
                                                setFooterColumns(newCols);
                                            }}
                                            style={{ marginLeft: "1rem", color: "red", background: "none", border: "none", cursor: "pointer" }}
                                        >Sil</button>
                                    </div>

                                    <div style={{ paddingLeft: "1rem", borderLeft: "2px solid var(--gray-200)" }}>
                                        {col.links.map((link: any, linkIndex: number) => (
                                            <div key={linkIndex} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
                                                <input 
                                                    type="text" 
                                                    value={link.label_tr} 
                                                    onChange={(e) => {
                                                        const newCols = [...footerColumns];
                                                        newCols[colIndex].links[linkIndex].label_tr = e.target.value;
                                                        setFooterColumns(newCols);
                                                    }}
                                                    placeholder="Etiket (TR)" 
                                                    style={{ flex: 1, padding: "0.4rem", border: "1px solid var(--gray-300)", borderRadius: "4px" }}
                                                />
                                                <input 
                                                    type="text" 
                                                    value={link.label_en} 
                                                    onChange={(e) => {
                                                        const newCols = [...footerColumns];
                                                        newCols[colIndex].links[linkIndex].label_en = e.target.value;
                                                        setFooterColumns(newCols);
                                                    }}
                                                    placeholder="Etiket (EN)" 
                                                    style={{ flex: 1, padding: "0.4rem", border: "1px solid var(--gray-300)", borderRadius: "4px" }}
                                                />
                                                <input 
                                                    type="text" 
                                                    value={link.href} 
                                                    onChange={(e) => {
                                                        const newCols = [...footerColumns];
                                                        newCols[colIndex].links[linkIndex].href = e.target.value;
                                                        setFooterColumns(newCols);
                                                    }}
                                                    placeholder="URL (örn: /about)" 
                                                    style={{ flex: 1, padding: "0.4rem", border: "1px solid var(--gray-300)", borderRadius: "4px" }}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const newCols = [...footerColumns];
                                                        newCols[colIndex].links = newCols[colIndex].links.filter((_: any, i: number) => i !== linkIndex);
                                                        setFooterColumns(newCols);
                                                    }}
                                                    style={{ color: "red", background: "none", border: "none", cursor: "pointer" }}
                                                >×</button>
                                            </div>
                                        ))}
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const newCols = [...footerColumns];
                                                newCols[colIndex].links.push({ label_tr: "", label_en: "", href: "" });
                                                setFooterColumns(newCols);
                                            }}
                                            style={{ fontSize: "0.85rem", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: "0.5rem 0" }}
                                        >+ Yeni Link Ekle</button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                type="button" 
                                onClick={() => setFooterColumns([...footerColumns, { title_tr: "", title_en: "", links: [] }])}
                                className="btn btn-secondary" 
                                style={{ alignSelf: "flex-start" }}
                            >+ Yeni Sütun Ekle</button>
                        </div>
                    </div>

                    {/* Footer Description & Social Media */}
                    <div style={{ padding: "1.5rem", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", backgroundColor: "var(--gray-50)" }}>
                        <h3 style={{ marginBottom: "0.5rem", color: "var(--primary)", borderBottom: "1px solid var(--gray-200)", paddingBottom: "0.5rem" }}>Footer Açıklama ve Sosyal Medya</h3>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Şirket Kısa Açıklaması - TR</label>
                                <textarea
                                    value={footerDesc_tr}
                                    onChange={(e) => setFooterDescTr(e.target.value)}
                                    rows={3}
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Şirket Kısa Açıklaması - EN</label>
                                <textarea
                                    value={footerDesc_en}
                                    onChange={(e) => setFooterDescEn(e.target.value)}
                                    rows={3}
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Instagram URL</label>
                                <input
                                    type="url"
                                    value={instagramUrl}
                                    onChange={(e) => setInstagramUrl(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>Twitter URL</label>
                                <input
                                    type="url"
                                    value={twitterUrl}
                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--gray-700)" }}>YouTube URL</label>
                                <input
                                    type="url"
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.375rem", border: "1px solid var(--gray-300)" }}
                                />
                            </div>
                        </div>
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
