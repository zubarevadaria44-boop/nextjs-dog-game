// app/layout.tsx
// Общий каркас для ВСЕХ страниц сайта — шрифты, <html>, <body>.
// Next.js требует этот файл — без него проект не соберётся.

export const metadata = {
  title: "Платформер с собакой",
  description: "Игра на Next.js",
};

// Настройки для телефонов: запрещаем случайный зум щипком/двойным тапом,
// чтобы не мешало при быстром нажатии кнопок управления.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, overscrollBehavior: "none" }}>{children}</body>
    </html>
  );
}
