import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  return <>
    <NavBar />
    {children}
    <Footer />
  </>;
}
