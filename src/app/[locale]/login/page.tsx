"use client";

import { useState } from "react";
import styles from "./login.module.css";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                // Hard refresh to ensure SessionProvider and Header re-mount with new auth state
                window.location.href = "/admin";
            }
        } catch (err) {
            setError("Giriş işlemi sırasında bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <section className={styles.pageHeader}>
                <div className="container">
                    <h1 className={styles.pageTitle}>System Login</h1>
                    <p className={styles.pageDesc}>Portal access for Dealers and Administrators.</p>
                </div>
            </section>

            <section className={`section ${styles.loginSection}`}>
                <div className="container">
                    <div className={styles.loginCard}>
                        <h2>Sign In</h2>
                        {error && <div className={styles.errorAlert}>{error}</div>}
                        <form onSubmit={handleLogin} className={styles.form}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="e.g. dealer@test.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Use 'password'"
                                />
                            </div>
                            <div className={styles.formOptions}>
                                <div className={styles.checkbox}>
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember">Remember me</label>
                                </div>
                                <Link href="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
                            </div>

                            <button type="submit" disabled={isLoading} className={`btn btn-primary ${styles.loginBtn}`}>
                                {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                            </button>
                        </form>

                        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
                            <p style={{ color: "var(--gray-500)" }}>
                                Don't have an account yet? <Link href="/register" style={{ color: "var(--primary)", fontWeight: "bold" }}>Sign Up</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
