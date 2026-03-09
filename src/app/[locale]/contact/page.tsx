"use client";

import { useState } from "react";
import styles from "./contact.module.css";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";

export default function ContactUs() {
    const t = useTranslations("Common");
    const locale = useLocale();
    const isTr = locale === "tr";

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage({ type: "", text: "" });

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || (isTr ? "Bir hata oluştu." : "Something went wrong."));
            }

            setStatusMessage({ type: "success", text: isTr ? "Mesajınız alındı. En kısa sürede dönüş yapacağız." : "Your message has been received." });
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (error: any) {
            setStatusMessage({ type: "error", text: error.message || (isTr ? "Mesaj gönderilemedi." : "Failed to send message.") });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{isTr ? "İletişim" : "Contact Us"}</h1>
                    <p className={styles.pageDesc}>
                        {isTr
                            ? "Projeniz için uygun bir çözüm mü arıyorsunuz? Mühendislik ekibimizle iletişime geçin."
                            : "Are you looking for a suitable solution for your project? Contact our engineering team."}
                    </p>
                </div>
            </section>

            <section className={`section ${styles.contactSection}`}>
                <div className={`container ${styles.contactGrid}`}>

                    <div className={styles.contactInfo}>
                        <h2>{isTr ? "Kurumsal Bilgiler" : "Corporate Information"}</h2>
                        <p className={styles.infoDesc}>
                            {isTr
                                ? "Çalışma saatlerimizde bizi ziyaret edebilir veya kesintisiz destek hatlarımızdan bize ulaşabilirsiniz."
                                : "You can visit us during our working hours or reach us through our continuous support lines."}
                        </p>

                        <div className={styles.infoBlocks}>
                            <div className={styles.infoCard}>
                                <div className={styles.icon}>📍</div>
                                <div>
                                    <h3>{isTr ? "Genel Merkez" : "Headquarters"}</h3>
                                    <p>{isTr ? "Teknoloji Plaza, AR-GE Caddesi No: 42\nKadıköy / İstanbul, Türkiye" : "Technology Plaza, R&D Street No: 42\nKadikoy / Istanbul, Turkey"}</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.icon}>📞</div>
                                <div>
                                    <h3>{isTr ? "Telefon & Destek" : "Phone & Support"}</h3>
                                    <p>+90 850 123 45 67<br />+90 216 987 65 43</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.icon}>✉️</div>
                                <div>
                                    <h3>{isTr ? "E-posta" : "Emails"}</h3>
                                    <p>{isTr ? "Satış: sales@welab.com\nDestek: support@welab.com" : "Sales: sales@welab.com\nSupport: support@welab.com"}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.workingHours}>
                            <h3>{isTr ? "Çalışma Saatleri" : "Working Hours"}</h3>
                            <ul>
                                <li><span>{isTr ? "Pazartesi - Cuma:" : "Monday - Friday:"}</span> <span>08:30 - 18:00</span></li>
                                <li><span>{isTr ? "Cumartesi:" : "Saturday:"}</span> <span>09:00 - 13:00</span></li>
                                <li><span>{isTr ? "Pazar:" : "Sunday:"}</span> <span>{isTr ? "Kapalı" : "Closed"}</span></li>
                            </ul>
                            <p className={styles.emergencyNote}>
                                {isTr
                                    ? "* Teknik servis sözleşmesi olan müşterilerimiz için 7/24 acil destek mevcuttur."
                                    : "* 24/7 emergency support is available for customers with technical service agreements."}
                            </p>
                        </div>
                    </div>

                    <div className={styles.contactFormWrapper}>
                        <div className={styles.formContainer}>
                            <h2>{isTr ? "Bize Mesaj Gönderin" : "Send Us a Message"}</h2>
                            {statusMessage.text && (
                                <div style={{
                                    padding: "1rem",
                                    marginBottom: "1.5rem",
                                    borderRadius: "4px",
                                    backgroundColor: statusMessage.type === "success" ? "#dcfce7" : "#fee2e2",
                                    color: statusMessage.type === "success" ? "#166534" : "#991b1b"
                                }}>
                                    {statusMessage.text}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">{isTr ? "Ad & Soyad *" : "First Name & Last Name *"}</label>
                                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">{isTr ? "E-posta *" : "Email *"}</label>
                                        <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone">{isTr ? "Telefon Numarası" : "Phone Number"}</label>
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="subject">{isTr ? "Konu" : "Subject"}</label>
                                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                                        <option value="">{isTr ? "Bir konu seçin..." : "Select a Subject..."}</option>
                                        <option value="Sales">{isTr ? "Satış & Fiyat Teklifi" : "Sales & Quoting"}</option>
                                        <option value="Tech Support">{isTr ? "Teknik Destek" : "Technical Support"}</option>
                                        <option value="Calibration">{isTr ? "Kalibrasyon & Bakım" : "Calibration & Maintenance"}</option>
                                        <option value="Other">{isTr ? "Diğer" : "Other"}</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="message">{isTr ? "Mesajınız *" : "Your Message *"}</label>
                                    <textarea id="message" name="message" rows={5} required value={formData.message} onChange={handleChange}></textarea>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <input type="checkbox" id="kvkk" required />
                                    <label htmlFor="kvkk">
                                        {isTr
                                            ? <><Link href="/privacy" className={styles.link}>Gizlilik Politikası</Link> metnini okudum ve kabul ediyorum.</>
                                            : <>I have read and agree to the <Link href="/privacy" className={styles.link}>Privacy Policy</Link> text.</>
                                        }
                                    </label>
                                </div>

                                <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                                    {loading ? (isTr ? "Gönderiliyor..." : "Sending...") : (isTr ? "Mesaj Gönder" : "Send Message")}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </section>

            <section className={styles.mapSection}>
                <div className={styles.mapPlaceholder}>
                    <span>{isTr ? "İnteraktif Google Haritalar (İstanbul Merkez) Alanı" : "Interactive Google Maps (Istanbul Headquarters) Area"}</span>
                </div>
            </section>
        </>
    );
}
