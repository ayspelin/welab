import TurkeyMap from "@/components/TurkeyMap";
import { useTranslations } from "next-intl";

export default function DealersPage() {
    const tNav = useTranslations("Navigation");
    const tDealers = useTranslations("Dealers");

    return (
        <main className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-white">{tNav('dealers')}</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    {tDealers('pageDesc')}
                </p>
            </div>
            
            <TurkeyMap />
        </main>
    );
}
