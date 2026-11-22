/**
 * Helpers for surviving a non-root deployment (GitHub Pages project sites).
 *
 * `next/link` and `router.push` add the base path automatically, but
 * `usePathname()` may hand back the path *with* the base path attached
 * (e.g. `/sia-seat-picker/seats`). Everything that compares a pathname has to
 * strip it first or the seat map silently loses its pointer events.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** `/sia-seat-picker/seats/` -> `/seats`; `/` stays `/`. */
export function appPath(pathname: string): string {
  let path = pathname;

  if (BASE_PATH && (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`))) {
    path = path.slice(BASE_PATH.length);
  }

  path = path.replace(/\/+$/, "");
  return path || "/";
}

/** Prefix an absolute app path with the deployment base path. */
export function withBasePath(path: string): string {
  if (!BASE_PATH || path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}
