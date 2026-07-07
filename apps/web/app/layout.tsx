import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillTree · Accueil",
  description: "Monte ta force de travail IA — apprends, installe des skills, bâtis ton Brain.",
};

// Pose le thème avant le paint pour éviter le flash (sombre par défaut).
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
