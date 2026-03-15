import TurkeyMap from "@/components/TurkeyMap";
import { useTranslations } from "next-intl";

export default function DealersPage() {
    const t = useTranslations("Navigation");

    return (
        <main className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-white">{t('dealers')}</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Türkiye genelindeki yetkili bayi ağımızı aşağıda yer alan interaktif harita üzerinden inceleyebilirsiniz.
                </p>
            </div>
            
            <TurkeyMap />
        </main>
    );
}
