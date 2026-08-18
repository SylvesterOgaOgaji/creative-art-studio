/**
 * Playful Atelier design reminder: public studio pages are field-journal leaves,
 * with a compact Spark lockup and an obvious path back to making.
 */
import { Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import "@/styles/makersEducatorExtensions.css";
import "@/styles/visualReviewRefinements.css";

export default function PublicStudioHeader() {
  const [location] = useLocation();
  const links = [
    { href: "/makers", label: "Meet the makers" },
    { href: "/educators", label: "For educators" },
    { href: "/classroom", label: "Classroom starter" },
  ];
  return (
    <header className="public-studio-header">
      <Link
        href="/"
        className="public-brand-lockup"
        aria-label="Return to Creative Art Studio"
      >
        <span className="public-spark" aria-hidden="true">
          <i className="spark-lobe lobe-coral" />
          <i className="spark-lobe lobe-yellow" />
          <i className="spark-lobe lobe-sea" />
          <i className="spark-lobe lobe-blue" />
          <i className="spark-core" />
        </span>
        <span>
          <b>Creative Art Studio</b>
          <small>Field journal</small>
        </span>
      </Link>
      <nav aria-label="Studio information">
        <Link href="/" className="return-to-studio">
          <Sparkles aria-hidden="true" />
          Make
        </Link>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={location === link.href ? "is-active" : ""}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
