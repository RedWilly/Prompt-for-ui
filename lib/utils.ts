import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${path}`;
}

export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in .env
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000/';

  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include trailing `/`.
  url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
  
  return url;
}
