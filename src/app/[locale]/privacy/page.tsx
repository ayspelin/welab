import { getTranslations } from "next-intl/server";

export default async function PrivacyPage() {
    const t = await getTranslations("Footer");
    return (
        <div className="container" style={{ padding: "8rem 0", minHeight: "60vh" }}>
            <h1>{t("privacy")}</h1>
            <p style={{ marginTop: "2rem" }}>Bu sayfa yapım aşamasındadır.</p>
        </div>
    );
}
