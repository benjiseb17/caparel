import type { Metadata } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
  Lexend,
  Nunito_Sans,
} from "next/font/google";
import "./globals.css";
import "./charte-caparel.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Charte de l'espace famille (design-caparel). Auto-hébergées comme les autres
// plutôt que chargées depuis Google Fonts à l'exécution.
const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Caparel — Relevé d'heures",
  description: "Relevé d'heures pour les intervenants à domicile Caparel",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jakarta.variable} ${lexend.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
