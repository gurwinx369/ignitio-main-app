import "./globals.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "Ignitio",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://www.youtube.com" />
        <link rel="preconnect" href="https://www.youtube-nocookie.com" />
        <link rel="preconnect" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.youtube.com" />
      </head>
      <ClientLayout>
        {children}
      </ClientLayout>
    </html>
  );
}