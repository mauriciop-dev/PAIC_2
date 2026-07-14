import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="PAIC 2.0 - Plataforma para la Administración Inteligente de Copropiedades" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
