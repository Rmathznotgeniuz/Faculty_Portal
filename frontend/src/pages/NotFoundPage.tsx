import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="py-10">
      <p className="text-xs font-semibold uppercase text-coral">404</p>
      <h1 className="mt-2 font-serif text-3xl font-medium">Page not found</h1>
      <Link className="mt-5 inline-block text-sm font-medium text-teal underline" to="/">
        Return home
      </Link>
    </section>
  );
}
