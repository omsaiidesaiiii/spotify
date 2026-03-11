import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "./StoreProvider";
import { ViewTransitions } from 'next-view-transitions';
import { BottomNav } from '../components/Navigation/BottomNav';
import { MiniPlayer } from '../components/Player/MiniPlayer';
import { AudioEngine } from '../components/Player/AudioEngine';
import { FullScreenPlayer } from '../components/Player/FullScreenPlayer';
import { OfflineGuard } from '../components/Navigation/OfflineGuard';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoundWave",
  description: "Immersive Music Experience",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SoundWave",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
        >
          <StoreProvider>
            <AudioEngine />
            <OfflineGuard>
              <div className="h-screen w-screen overflow-y-auto pb-32">
                {children}
              </div>
            </OfflineGuard>
            <MiniPlayer />
            <FullScreenPlayer />
            <BottomNav />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js');
                    });
                  }
                `,
              }}
            />
          </StoreProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
