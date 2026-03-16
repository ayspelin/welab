"use client";

import { useState } from "react";
import styles from "../login/login.module.css";
import { Link } from "@/i18n/routing";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Bir hata oluştu.");
            } else {
                setMessage(data.message);
                setEmail("");
            }
        } catch (err) {
            setError("İşlem sırasında bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>Şifremi Unuttum</h1>
                    <p className={styles.pageDesc}>Hesabınıza bağlı e-posta adresini girin.</p>
                </div>
            </section>

            <section className={`section ${styles.loginSection}`}>
                <div className="container">
                    <div className={styles.loginCard}>
                        <h2>Şifre Sıfırlama Talebi</h2>
                        
                        {error && <div className={styles.errorAlert}>{error}</div>}
                        {message && <div className={styles.successAlert} style={{ padding: "12px", backgroundColor: "#ecfdf5", color: "#065f46", borderRadius: "5px", marginBottom: "15px", border: "1px solid #a7f3d0" }}>{message}</div>}
                        
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">E-posta Adresi</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="ornek@email.com"
                                />
                            </div>

                            <button type="submit" disabled={isLoading} className={`btn btn-primary ${styles.loginBtn}`}>
                                {isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                            </button>
                        </form>

                        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
                            <p style={{ color: "var(--gray-500)" }}>
                                Giriş sayfasına dönmek için <Link href="/login" style={{ color: "var(--primary)", fontWeight: "bold" }}>Giriş Yap</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
