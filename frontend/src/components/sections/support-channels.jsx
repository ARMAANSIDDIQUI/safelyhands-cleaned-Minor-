import { Phone, Mail, MessageSquare, Apple, PlayCircle, MapPin } from 'lucide-react';

const SupportChannels = () => {
  const contactInfo = [
    {
      label: 'Phone Number',
      value: '+91 8218303038 / 7618341297',
      icon: <Phone size={24} className="text-white" />,
      link: 'tel:+917618341297',
    },
    {
      label: 'Address',
      value: 'Near Sai mandir Ramganga vihar MDA Moradabad 244001',
      icon: <MapPin size={24} className="text-white" />,
      link: 'https://maps.app.goo.gl/KZY2c7HvkHhAvhG69',
    },
    {
      label: 'Whatsapp',
      value: '+91 7618341297',
      icon: <MessageSquare size={24} className="text-white" />,
      link: 'https://wa.me/917618341297',
    },
  ];

  const appLinks = [
    {
      name: 'App Store',
      link: '#',
    },
    {
      name: 'Google Play',
      link: '#',
    },
  ];

  return (

    <section className="w-full bg-transparent font-sans">
      <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-16">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Contact Details Sidebar */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <div className="flex flex-col gap-8">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-center gap-4 group bg-transparent">
                  <div className="w-[50px] h-[50px] flex items-center justify-center bg-[#262626] rounded-xl transition-all duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] text-[#666666] font-normal leading-tight">
                      {item.label}
                    </span>
                    <a
                      href={item.link}
                      className="text-[20px] font-bold text-[#262626] hover:text-[#72bcd4] transition-colors duration-300"
                    >
                      {item.value}
                    </a>
                  </div>
                </div>
              ))}
            </div>


          </div>

          {/* Illustrative Graphic Area (Empty placeholder to match layout) */}
          <div className="hidden lg:flex w-full lg:w-1/2 justify-center items-center">
            <div className="relative w-full max-w-[400px] aspect-square opacity-80">
              {/* SVG from global assets placeholder or visual equivalent would go here */}
              {/* Based on screenshots, there's a multi-layered heart/chat icon graphic */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,_rgba(255,209,46,0.1)_0%,_rgba(255,255,255,0)_70%)] rounded-full"></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SupportChannels;