import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Container } from "./ui/Container";
import { Button } from "./ui/Button";
import { useBooking } from "../context/BookingContext";
import { Logo } from "./Logo";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Pregnancy Care", href: "#pregnancy-journey" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openBooking } = useBooking();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleNavClick(href: string) {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <Container>
        <div
          className={`flex items-center justify-between rounded-full border transition-all duration-300 ${
            scrolled
              ? "border-plum/10 bg-cream/90 px-4 py-2 shadow-[0_8px_30px_-12px_rgba(69,38,46,0.25)] backdrop-blur-xl"
              : "border-transparent bg-cream/40 px-4 py-2.5 backdrop-blur-md"
          }`}
        >
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#home");
            }}
            className="flex items-center gap-2.5"
          >
            <Logo className="h-9 w-9 shrink-0" />
            <span className="font-serif text-lg font-medium text-plum">
              Aura <span className="text-rose-600">Women's Health</span>
            </span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink/75 transition-colors hover:bg-plum/5 hover:text-plum"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Button size="sm" onClick={() => openBooking()}>
              Book an Appointment
            </Button>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-plum lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mx-5 mt-2 overflow-hidden rounded-3xl border border-plum/10 bg-cream shadow-xl lg:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.href);
                  }}
                  className="rounded-xl px-4 py-3 text-base font-medium text-ink/80 transition-colors hover:bg-rose-50 hover:text-plum"
                >
                  {link.label}
                </a>
              ))}
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  setMobileOpen(false);
                  openBooking();
                }}
              >
                Book an Appointment
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
