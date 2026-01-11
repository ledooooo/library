// app/layout.js
import "./globals.css";

export const metadata = {
  title: "مكتبة مركز طب أسرة غرب المطار",
  description: "المكتبة الطبية الإلكترونية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
