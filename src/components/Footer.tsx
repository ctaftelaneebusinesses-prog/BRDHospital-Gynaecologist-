import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Container } from "./ui/Container";
import { Logo } from "./Logo";
import { FacebookIcon, InstagramIcon, TwitterIcon } from "./SocialIcons";
import { useBooking } from "../context/BookingContext";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Pregnancy Care", href: "#pregnancy-journey" },
];

const serviceLinks = ["Gynecological Care"];

const socials = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: TwitterIcon, label: "Twitter" },
];

export function Footer() {
  const { openBooking } = useBooking();

  function handleNav(href: string) {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <footer className="relative bg-plum pt-20 text-cream/80">
      <Container>
        <div className="grid gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#home" onClick={(e) => { e.preventDefault(); handleNav("#home"); }} className="flex items-center gap-2.5">
              <Logo className="h-10 w-10 shrink-0 [&_circle:first-child]:fill-cream [&_circle:last-child]:fill-rose-500 [&_path]:fill-plum" />
              <span className="font-serif text-lg font-medium text-cream">
                BRD <span className="text-rose-300">Hospital</span>
              </span>
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/60">
              Premium gynecological care built around compassion, trust and
              modern medicine — for every stage of womanhood.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/10 text-cream/70 transition-colors hover:bg-rose-500 hover:text-cream"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-serif text-base font-medium text-cream">Quick Links</h4>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(link.href);
                    }}
                    className="text-sm text-cream/60 transition-colors hover:text-rose-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base font-medium text-cream">Services</h4>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((service) => (
                <li key={service}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openBooking();
                    }}
                    className="text-sm text-cream/60 transition-colors hover:text-rose-300"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base font-medium text-cream">Contact</h4>
            <ul className="mt-5 space-y-4 text-sm text-cream/60">
              <li className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-rose-300" />
                077290 28405
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-rose-300" />
                care@brdhospital.com
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-rose-300" />
                Opposite R&amp;B Guest House, Near Area Hospital Circle, Kuppam, Andhra Pradesh
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-rose-300" />
                Open 24 Hours, Monday – Sunday
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-cream/10 py-7 text-xs text-cream/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} BRDHospital. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-rose-300">
              Privacy Policy
            </a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-rose-300">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
