"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import ConciergeWidget from "@/components/concierge/ConciergeWidget";

export default function ShellWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const hideConcierge =
    isAdmin ||
    pathname === "/cart" ||
    pathname.startsWith("/order/") ||
    pathname === "/login";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      {!hideConcierge && <ConciergeWidget />}
    </>
  );
}
