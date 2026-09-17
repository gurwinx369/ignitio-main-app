import { Noto_Sans, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from "./client-layout-wrapper";

const notoSans = Noto_Sans({
    variable: "--font-noto-sans",
    display: "swap",
    subsets: ["latin"],
});

const pixelifySans = Pixelify_Sans({
    variable: "--font-pixelify",
    display: "swap",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const viewport = {
    themeColor: "#00A9FF",
    width: "device-width",
    initialScale: 1,
};

export const metadata = {
    metadataBase: new URL('https://app.ignitio.cloud'),
    title: {
        default: "Ignitio | AI-Powered Personalized Tech Learning Platform",
        template: "%s | Ignitio"
    },
    description: "Accelerate your tech skills with Ignitio's personalized AI-driven roadmaps, interactive coding playgrounds, and real-time AI doubt solver.",
    keywords: ["AI learning", "personalized learning", "C++ roadmap", "Git tutorial", "GitHub interactive course", "Prompt Engineering course", "personalized curriculum", "interactive code editor", "AI tutor"],
    authors: [{ name: "Ignitio Team" }],
    creator: "Ignitio",
    publisher: "Ignitio",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://app.ignitio.cloud",
        siteName: "Ignitio",
        title: "Ignitio | AI-Powered Personalized Tech Learning Platform",
        description: "Accelerate your tech skills with Ignitio's personalized AI-driven roadmaps, interactive coding playgrounds, and real-time AI doubt solver.",
        images: [
            {
                url: "/ignitio-logo.png",
                width: 1200,
                height: 630,
                alt: "Ignitio AI Personalized Learning",
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Ignitio | AI-Powered Personalized Tech Learning Platform",
        description: "Accelerate your tech skills with Ignitio's personalized AI-driven roadmaps, interactive coding playgrounds, and real-time AI doubt solver.",
        images: ["/ignitio-logo.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function RootLayout({ children }) {
    const bodyClass = `${notoSans.variable} ${pixelifySans.variable} antialiased`;

    return (
        <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://ignitio-7e45a.firebaseapp.com" />
                <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
                <link rel="dns-prefetch" href="https://ignitio-7e45a.firebaseapp.com" />
                <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
                <link rel="preconnect" href="https://www.youtube" />
                <link rel="preconnect" href="https://www.youtube-nocookie.com" />
                <link rel="preconnect" href="https://i.ytimg.com" />
                <link rel="dns-prefetch" href="https://www.youtube" />
            </head>
            <ClientLayoutWrapper bodyClass={bodyClass}>
                {children}
            </ClientLayoutWrapper>
        </html>
    );
}
