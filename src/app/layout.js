import Script from 'next/script';
import localFont from 'next/font/local';

import { AuthProvider } from 'context/auth-context';
import { AudioProvider } from 'context/audio-context';
import { ThemeProvider } from 'context/theme-context';

import Header from 'components/header';
import Footer from 'components/footer';

import 'styles/css/theme/theme.css';

const proximaNova = localFont({
  src: '../styles/fonts/proxima-nova.woff', 
  variable: '--primary-font-family'
});

const montserrat = localFont({
  src: '../styles/fonts/montserrat.woff', 
  variable: '--secondary-font-family'
});

export const metadata = {
  title: 'EchoVerse',
  description: 'A universe that speak to you'
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <head>
        <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free/css/all.min.css' />
        <Script src='https://cdn.jsdelivr.net/npm/media-chrome@3/+esm' type='module' strategy='afterInteractive' />
      </head>
      <body className={`${proximaNova.variable} ${montserrat.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <AudioProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};