"use client";

import { useState } from "react";
import styles from "./contact.module.css";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ContactUs() {
    const t = useTranslations("Common");
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
                throw new Error(errorData.message || "Something went wrong.");
            }

            setStatusMessage({ type: "success", text: t('message_sent') || "Your message has been received." });
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        } catch (error: any) {
            setStatusMessage({ type: "error", text: error.message || "Failed to send message." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>{t('contact')}</h1>
                    <p className={styles.pageDesc}>Are you looking for a suitable solution for your project? Contact our engineering team.</p>
                </div>
            </section>

            <section className={`section ${styles.contactSection}`}>
                <div className={`container ${styles.contactGrid}`}>

                    <div className={styles.contactInfo}>
                        <h2>Corporate Information</h2>
                        <p className={styles.infoDesc}>You can visit us during our working hours or reach us through our continuous support lines.</p>

                        <div className={styles.infoBlocks}>
                            <div className={styles.infoCard}>
                                <div className={styles.icon}>📍</div>
                                <div>
                                    <h3>Headquarters</h3>
                                    <p>Technology Plaza, R&D Street No: 42<br />Kadikoy / Istanbul, Turkey</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.icon}>📞</div>
                                <div>
                                    <h3>Phone & Support</h3>
                                    <p>+90 850 123 45 67<br />+90 216 987 65 43</p>
                                </div>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.icon}>✉️</div>
                                <div>
                                    <h3>Emails</h3>
                                    <p>Sales: sales@WELAB.com<br />Support: support@WELAB.com</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.workingHours}>
                            <h3>Working Hours</h3>
                            <ul>
                                <li><span>Monday - Friday:</span> <span>08:30 - 18:00</span></li>
                                <li><span>Saturday:</span> <span>09:00 - 13:00</span></li>
                                <li><span>Sunday:</span> <span>Closed</span></li>
                            </ul>
                            <p className={styles.emergencyNote}>* 24/7 emergency support is available for customers with technical service agreements.</p>
                        </div>
                    </div>

                    <div className={styles.contactFormWrapper}>
                        <div className={styles.formContainer}>
                            <h2>Send Us a Message</h2>
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
                                    <label htmlFor="name">First Name & Last Name *</label>
                                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">Email *</label>
                                        <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="phone">Phone Number</label>
                                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="subject">Subject</label>
                                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange}>
                                        <option value="">Select a Subject...</option>
                                        <option value="Sales">Sales & Quoting</option>
                                        <option value="Tech Support">Technical Support</option>
                                        <option value="Calibration">Calibration & Maintenance</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="message">Your Message *</label>
                                    <textarea id="message" name="message" rows={5} required value={formData.message} onChange={handleChange}></textarea>
                                </div>

                                <div className={styles.checkboxGroup}>
                                    <input type="checkbox" id="kvkk" required />
                                    <label htmlFor="kvkk">I have read and agree to the <Link href="/privacy" className={styles.link}>Privacy Policy</Link> text.</label>
                                </div>

                                <button type="submit" disabled={loading} className={`btn btn-primary ${styles.submitBtn}`}>
                                    {loading ? "Sending..." : "Send Message"}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </section>

            <section className={styles.mapSection}>
                <div className={styles.mapPlaceholder}>
                    <span>Interactive Google Maps (Istanbul Headquarters) Area</span>
                </div>
            </section>
        </>
    );
}

