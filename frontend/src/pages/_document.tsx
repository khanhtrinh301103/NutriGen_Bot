// src/pages/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Thêm các meta tags, fonts, v.v. ở đây */}
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Script để tránh lỗi hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent hydration errors by ensuring window.__NEXT_DATA__ exists
              window.__forceSmoothScroll = true;
              window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
            `,
          }}
        />
      </body>
    </Html>
  );
}