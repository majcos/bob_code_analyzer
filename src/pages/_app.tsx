/**
 * Next.js App Component
 * Global application wrapper with styles
 */

import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// Made with Bob
