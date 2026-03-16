"use client";

import { useState, useEffect } from "react";
import styles from "../login/login.module.css";
import { Link } from "@/i18n/routing";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Geçersiz veya eksik sıfırlama bağlantısı.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Bir hata oluştu.");
            } else {
                setMessage(data.message);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
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
                    <h1 className={styles.pageTitle}>Yeni Şifre Belirleme</h1>
                    <p className={styles.pageDesc}>Lütfen yeni şifrenizi girin.</p>
                </div>
            </section>

            <section className={`section ${styles.loginSection}`}>
                <div className="container">
                    <div className={styles.loginCard}>
                        <h2>Şifre Yenileme</h2>
                        
                        {error && <div className={styles.errorAlert}>{error}</div>}
                        {message && <div className={styles.successAlert} style={{ padding: "12px", backgroundColor: "#ecfdf5", color: "#065f46", borderRadius: "5px", marginBottom: "15px", border: "1px solid #a7f3d0" }}>{message}</div>}
                        
                        {!token && !error && (
                            <div className={styles.errorAlert}>Yükleniyor...</div>
                        )}

                        {token && !message && (
                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="password">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        id="password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="En az 6 karakter"
                                        minLength={6}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Şifrenizi doğrulayın"
                                        minLength={6}
                                    />
                                </div>

                                <button type="submit" disabled={isLoading} className={`btn btn-primary ${styles.loginBtn}`}>
                                    {isLoading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                                </button>
                            </form>
                        )}

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
