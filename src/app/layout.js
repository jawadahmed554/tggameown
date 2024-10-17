import "./globals.css";
import { Inter } from "next/font/google";
import Providers from "./Providers";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "thirdweb SDK + Next starter",
  description: "Starter template for using thirdweb SDK with Next.js App router",
};

console.log("[layout.js] layout.js file loaded");

export default function RootLayout({ children }) {
  console.log("[layout.js] RootLayout function called");

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="beforeInteractive" 
        />
      </body>
    </html>
  );
}