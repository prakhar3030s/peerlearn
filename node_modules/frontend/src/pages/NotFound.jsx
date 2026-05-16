import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button.jsx";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-5xl flex-col items-center justify-center px-4 text-center"
      style={{ paddingTop: 56 + 16 }}
    >
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="relative">
          <span className="text-6xl font-extrabold tracking-tight text-gradient md:text-7xl">
            404
          </span>
          <svg
            className="pointer-events-none absolute -right-16 top-4 h-16 w-16 text-brand-500 float-slow"
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="10"
              y="14"
              width="44"
              height="32"
              rx="4"
              className="fill-[var(--bg-surface)] stroke-[var(--border-default)]"
              strokeWidth="2"
            />
            <path
              d="M16 22h32M16 28h20M16 34h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M18 46c3-4 7-6 14-6s11 2 14 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] md:text-2xl">
            Page not found
          </h1>
          <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="md" onClick={() => navigate("/")}>
          Go Home
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => navigate("/browse")}
        >
          Browse Videos
        </Button>
      </div>
    </div>
  );
}

