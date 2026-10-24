import Link from "next/link";
import { Container, btn } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="font-display text-7xl font-bold text-royal">404</p>
      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">This page isn&apos;t on our list</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        The link may be old or mistyped. Try searching colleges, or head back to the home page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/colleges" className={btn.primary}>Search colleges</Link>
        <Link href="/" className={btn.ghost}>Go to home</Link>
      </div>
    </Container>
  );
}
