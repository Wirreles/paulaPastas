"use client";

import Script from "next/script";
import { useDelayedScripts } from "@/hooks/useDelayedScripts";

export default function Analytics() {
    // Aplicamos un pequeño delay de 1000ms tras la primera interacción 
    // para asegurar que el hilo principal esté libre
    const shouldLoad = useDelayedScripts(1000);

    if (!shouldLoad) return null;

    return (
        <>
            {/* Google Tag Manager */}
            <Script
                id="gtm-script"
                dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TRQ7MJL5');`,
                }}
            />

            {/* Google Analytics (GA4) */}
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-FCTYS7HER2" />
            <Script
                id="google-analytics"
                dangerouslySetInnerHTML={{
                    __html: `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-FCTYS7HER2');`,
                }}
            />

            {/* Facebook Pixel */}
            <Script
                id="fb-pixel"
                dangerouslySetInnerHTML={{
                    __html: `!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '2255346224965031');
          fbq('track', 'PageView');`,
                }}
            />

            {/* Microsoft Clarity */}
            <Script
                id="clarity-script"
                dangerouslySetInnerHTML={{
                    __html: `(function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "vva4r0prt3");`,
                }}
            />
        </>
    );
}