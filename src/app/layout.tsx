import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});
/** Devanagari serif for the name सुस्मिता (Nunito/Fraunces have no Devanagari glyphs). */
const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sudoku for सुस्मिता",
  description: "A cozy, mobile-first Sudoku — made with love for सुस्मिता.",
  applicationName: "Sudoku for सुस्मिता",
  appleWebApp: { capable: true, title: "Sudoku", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0e1117",
};

/** Applies the saved theme before first paint to avoid a flash. */
const themeScript = `try{var s=JSON.parse(localStorage.getItem("susssudoku:settings:v1")||"{}");var t=s.theme;if(s.themeVersion!==2||(t!=="light"&&t!=="dark"&&t!=="cozy")){t="dark"}document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={`${nunito.variable} ${fraunces.variable} ${tiro.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
