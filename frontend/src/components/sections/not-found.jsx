import React from 'react';
import Image from 'next/image';

/**
 * NotFound component for the 404 error page.
 * Features a "Page Not Found" heading, a centered GIF illustration of a cleaning scene,
 * and a "Go To Home" call-to-action button.
 */
const NotFound = () => {
  // Asset constant
  const notFoundGif = "https://placehold.co/800x600/ffffff/0056D2?text=Cleaning+in+Progress...+(404)";

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center text-[#212529] font-sans">
      <div className="w-full max-w-[1200px] text-center">
        {/* Main Heading as per computed styles: 80px fontSize, 20px vertical margins */}
        <h1 className="text-[40px] md:text-[80px] font-bold leading-tight mt-[50px] mb-[20px] text-[#212529]">
          Page Not Found
        </h1>

        {/* Illustration Container */}
        <div className="flex justify-center items-center my-[20px]">
          <div className="relative w-full max-w-[960px] aspect-[4/3] flex justify-center">
            <Image
              src={notFoundGif}
              alt="Page not found"
              width={960}
              height={720}
              priority
              unoptimized // Important for GIFs to animate properly
              className="max-w-[80%] md:max-w-[50%] h-auto object-contain"
            />
          </div>
        </div>

        {/* CTA Button Container: margin-top: -40px based on computed styles */}
        <div className="mt-[-20px] md:mt-[-40px] mb-[50px]">
          <a
            href="/services"
            className="inline-block bg-[#007bff] hover:bg-[#0069d9] text-white text-[20px] font-normal py-[8px] px-[16px] rounded-[4.8px] transition-colors duration-150 ease-in-out no-underline cursor-pointer"
          >
            Go To Home
          </a>
        </div>
      </div>

      {/* Internal style to replicate the red text mobile override mentioned in styles */}
      <style jsx global>{`
        @media screen and (max-width: 450px) {
          h1 {
            color: #212529 !important; /* Overriding the red color mention in computed styles as it seems like a dev artifact/test */
            font-size: 40px !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;