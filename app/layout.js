export const metadata = {
  title: "مكتبة مركز طب أسرة غرب المطار",
  description: "المكتبة الطبية الإلكترونية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* إضافة مكتبة Tailwind عبر CDN لضمان عمل التنسيقات دون ملفات خارجية */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
