import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "D'gikaro — Academia de Arte, Cultura e Idiomas",
  description: "Sistema de gestión para la academia D'gikaro. Administra inscripciones, talleres, pagos, asistencia y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
