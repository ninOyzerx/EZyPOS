import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="POS Dashboard" />
        
        {/* Preload CSS and JavaScript */}
        <link rel="preload" href="/vendor/fontawesome-free/css/all.min.css" as="style" />
        <link rel="preload" href="https://code.jquery.com/jquery-3.6.0.min.js" as="script" />
        
        {/* Load CSS */}
        <link href="/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet" />
        <link href="/css/sb-admin-2.min.css" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
