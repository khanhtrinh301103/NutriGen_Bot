import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';

function AdminApp({ Component, pageProps }: AppProps) {
  const [isBrowser, setIsBrowser] = useState(false);
  
  useEffect(() => {
    setIsBrowser(true);
  }, []);
  
  // During SSR, render a loading state
  if (!isBrowser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading admin interface...</h2>
          <p className="mt-2">Please wait while we set up your admin dashboard</p>
        </div>
      </div>
    );
  }
  
  // Only render the full admin UI on the client
  return <Component {...pageProps} />;
}


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default AdminApp;