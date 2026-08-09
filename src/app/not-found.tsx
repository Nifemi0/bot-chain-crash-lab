import Link from "next/link";

export default function NotFound() {
  return (
    <main className="error-page">
      <p className="eyebrow">404 / route not found</p>
      <h1>This lab bench does not exist.</h1>
      <Link className="button button--primary" href="/">Return to Crash Lab</Link>
    </main>
  );
}
