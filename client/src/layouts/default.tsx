import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-dvh max-h-dvh">
      <Navbar />
      <main className="container mx-auto max-w-screen-lg flex-grow pb-6">
        {children}
      </main>
    </div>
  );
}
