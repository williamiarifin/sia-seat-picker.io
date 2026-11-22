import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SceneRoot } from "@/components/scene/SceneRoot";
import { ContentLayer } from "@/components/scene/ContentLayer";
import { BookingHydrator } from "@/components/scene/BookingHydrator";

export const metadata: Metadata = {
  title: "Silverkris Air — Choose your seat",
  description:
    "A 3D seat-selection experience. Explore the aircraft from above, then step inside the cabin.",
};

export const viewport: Viewport = {
  themeColor: "#050d1a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SceneRoot />
        <BookingHydrator />
        <ContentLayer>{children}</ContentLayer>
      </body>
    </html>
  );
}
