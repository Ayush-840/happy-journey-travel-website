import { Poppins } from "next/font/google";
import "./globals.css";
import ChatBot from "@/components/ChatBot";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Happy Journey | Discover India",
  description: "Plan your next adventure across India. Find tourist places, book transport, and explore stays — all in one place.",
  keywords: "travel india, tourist places, trip planning, book cab, hotels india",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✈️</text></svg>" />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        {children}
        <ChatBot />
        <SOSButton />
      </body>
    </html>
  );
}
