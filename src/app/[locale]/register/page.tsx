"use client";

import { useState } from "react";
import styles from "../login/login.module.css";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState({ type: "", text: "" });
    const [isLoading, setIsLoading] = useState(false);

    // We omit useRouter redirect for now as we want to show the success message

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: "", text: "" });

        if (password !== confirmPassword) {
            setMessage({ type: "error", text: "Şifreler eşleşmiyor!" });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Kayıt sırasında bir hata oluştu.");
            }

            setMessage({ type: "success", text: data.message || "Kayıt başarılı! Lütfen doğrulama için e-postanızı kontrol edin." });
            setEmail("");
            setPassword("");
            setConfirmPassword("");

        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>Bayi Kaydı (Dealer Registration)</h1>
                    <p className={styles.pageDesc}>Sisteme erişim sağlamak için portalımıza kayıt olun.</p>
                </div>
            </section>

            <section className={`section ${styles.loginSection}`}>
                <div className="container">
                    <div className={styles.loginCard}>
                        <h2>Kayıt Ol</h2>

                        {message.text && (
                            <div style={{
                                padding: "1rem", marginBottom: "1.5rem", borderRadius: "4px",
                                backgroundColor: message.type === "success" ? "#dcfce7" : "#fee2e2",
                                color: message.type === "success" ? "#166534" : "#991b1b"
                            }}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">E-posta Adresi</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Örn: bayi@firma.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="password">Şifre</label>
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="En az 6 karakter"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="confirmPassword">Şifre (Tekrar)</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    required
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Şifrenizi tekrar giriniz"
                                />
                            </div>

                            <button type="submit" disabled={isLoading} className={`btn btn-primary ${styles.loginBtn}`}>
                                {isLoading ? "Kaydediliyor..." : "Hesap Oluştur"}
                            </button>
                        </form>

                        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
                            <p style={{ color: "var(--gray-500)" }}>
                                Zaten bir hesabınız var mı? <Link href="/login" style={{ color: "var(--primary)", fontWeight: "bold" }}>Giriş Yap</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
