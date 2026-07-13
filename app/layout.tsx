// app/layout.tsx
// Общий каркас для ВСЕХ страниц сайта — шрифты, <html>, <body>.
// Next.js требует этот файл — без него проект не соберётся.

export const metadata = {
  title: "Платформер с собакой",
  description: "Игра на Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
