import { Navbar } from "@/components/global/navbar";
import { Footer } from "@/components/global/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col w-full mx-auto">
      <Navbar />
      <div className="flex-1 flex flex-col w-full">{children}</div>
      <Footer />
    </div>
  );
}
