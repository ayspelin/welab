import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import CookieBanner from "@/components/CookieBanner";

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

function getMetadataBase() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://welab.com";
  const normalizedUrl = configuredUrl.includes("localhost") ? "https://welab.com" : configuredUrl;

  return new URL(normalizedUrl);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const defaultTitle = locale === 'tr' 
    ? "WeLab | Güvenilir Laboratuvar Çözüm Ortağınız"
    : "WeLab | Your Trusted Partner in Laboratory Solutions";

  const description = locale === 'tr'
    ? "Endüstriyel laboratuvar cihazları, kalite kontrol sistemleri ve anahtar teslim laboratuvar çözümleri. Yetkili distribütörlük ve 7/24 teknik servis."
    : "Industrial laboratory equipment, quality control systems, and turnkey lab solutions. Authorized distributor with 24/7 technical service.";

  return {
    metadataBase: getMetadataBase(),
    title: {
      template: "%s | WeLab",
      default: defaultTitle,
    },
    description,
    openGraph: {
      title: defaultTitle,
      description,
      siteName: "WeLab",
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      type: "website",
    }
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            <CookieBanner />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
