"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-page">
      <p className="eyebrow">Crash Lab / runtime fault</p>
      <h1>The evidence console stopped unexpectedly.</h1>
      <p>No transaction was sent. Retry the local interface or inspect the health endpoint.</p>
      <button className="button button--primary" onClick={reset}>Retry</button>
    </main>
  );
}
