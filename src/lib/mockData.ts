export type Role = "SUPER_ADMIN" | "ADMIN" | "DEALER";

export interface MockUser {
    id: string;
    email: string;
    name: string;
    role: Role;
}

export const mockUsers: MockUser[] = [
    { id: "u1", email: "superadmin@test.com", name: "Super Admin User", role: "SUPER_ADMIN" },
    { id: "u2", email: "admin@test.com", name: "Admin User", role: "ADMIN" },
    { id: "u3", email: "dealer@test.com", name: "Dealer User", role: "DEALER" },
];

export const mockCategories = [
    { id: "c1", name: "Analitik Cihazlar", image: "/images/placeholder.jpg" },
    { id: "c2", name: "Genel Laboratuvar Cihazları", image: "/images/placeholder.jpg" },
    { id: "c3", name: "Numune Hazırlama Cihazları", image: "/images/placeholder.jpg" },
    { id: "c4", name: "Yaşam Bilimleri", image: "/images/placeholder.jpg" },
    { id: "c5", name: "Gıda Test Cihazları", image: "/images/placeholder.jpg" },
    { id: "c6", name: "Petrokimya Test Cihazları", image: "/images/placeholder.jpg" },
];

export const mockBrands = [
    { id: "b1", name: "TechAna (Germany)" },
    { id: "b2", name: "SpectraGen (USA)" },
    { id: "b3", name: "AquaPure (Sweden)" },
];

export const mockProducts = [
    {
        id: "p1",
        name: "C 6000 Isoperibol Package 1/12",
        brandId: "b1",
        categoryId: "c1",
        description: "IKA C 6000 Isoperibol Package 1/12 global standart oksijen bombası kalorimetresi, modern bir teknolojiyi, değişkenliği ve otomasyonu (adyabatik, isoperibol; dinamik modlar) bir cihazda birleştirir. DIN, ISO, ASTM, GOST ve GB gibi tüm bomba kalorimetre standartlarına göre çalışır. Operatör, adyabatik, isoperibol veya dinamik ölçüm modlarından her birinde üç farklı başlangıç sıcaklığı (22 °C, 25 °C, 30 °C) arasında seçim yapabilir.",
        image: "/images/placeholder.jpg",
        status: "Active",
        specs: [
            { label: "Modlar", value: "Adyabatik, Isoperibol, Dinamik" },
            { label: "Standartlar", value: "DIN, ISO, ASTM, GOST, GB" },
            { label: "Başlangıç Sıcaklıkları", value: "22 °C, 25 °C, 30 °C" },
        ],
        pdfUrl: "/docs/sample.pdf"
    },
    {
        id: "p2",
        name: "C 6000 Isoperibol Package 1/10",
        brandId: "b1",
        categoryId: "c1",
        description: "Standard model with different packaging options.",
        image: "/images/placeholder.jpg",
        status: "Active",
        specs: [
            { label: "Modlar", value: "Adyabatik, Isoperibol" },
        ],
        pdfUrl: "/docs/sample.pdf"
    },
    {
        id: "p3",
        name: "C 6000 Global Standards Package 1/12",
        brandId: "b2",
        categoryId: "c1",
        description: "Global standards compliant package. / Global standartlara uygun paket.",
        image: "/images/placeholder.jpg",
        status: "Active",
        specs: [],
        pdfUrl: "#"
    },
    {
        id: "p4",
        name: "C 6000 Global Standards Package 1/10",
        brandId: "b2",
        categoryId: "c1",
        description: "Alternative global standards package. / Alternatif global standart paket.",
        image: "/images/placeholder.jpg",
        status: "Active",
        specs: [],
        pdfUrl: "#"
    },
    {
        id: "p5",
        name: "Elmasonic P 30H",
        brandId: "b1",
        categoryId: "c2",
        description: "Özel işlevlerle donatılmış Elmasonic P üniteleri, analitik ve tıbbi laboratuvarlardaki görevler ve uygulamalar veya endüstriyel alanlardaki yoğun temizlik için ideal bir yardımcıdır.\n\nEquipped with special functions, Elmasonic P units are ideal helpers for analytical and medical laboratory tasks or intensive cleaning in industrial areas.\n\nÜrün serisi, farklı uygulamalar için 6 farklı hacim formatını ve 37/80 kHz çok frekanslı teknolojiyi içermektedir. (The product series includes 6 different volume formats and 37/80 kHz multi-frequency technology for different applications.)\n\nÜrün Özellikleri (Product Features):\n• Total kapasite / Total capacity 2.7 L\n• Kullanılması önerilen kapasite / Recommended capacity 1.9 L\n• Dış boyutlar / Ext. dimensions: 300 / 179 / 221 mm",
        image: "/images/placeholder.jpg",
        status: "Active",
        specs: [],
        pdfUrl: "#"
    },
    {
        id: "p6",
        name: "Elmasonic P 60H",
        brandId: "b1",
        categoryId: "c2",
        description: "Büyük kapasiteli ultrasonik temizleme cihazı. / Large capacity ultrasonic cleaner.",
        image: "/images/placeholder.jpg",
        status: "Active",
        specs: [],
        pdfUrl: "#"
    },
];

export const mockDocuments = [
    { id: "d1", title: "HPLC Installation Manual (Service)", type: "PDF", date: "2026-01-15", url: "#" },
    { id: "d2", title: "TechAna 2026 Q1 Dealer Price List", type: "EXCEL", date: "2026-02-01", url: "#" },
    { id: "d3", title: "Spectrophotometer Calibration Guide", type: "WORD", date: "2026-01-20", url: "#" },
];
