import Layout from "./components/common/layout";
import { useEffect, useState } from "react";

export default function TermsOfService() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: "📘",
      text:
        "By accessing or using NutriGen Bot, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service."
    },
    {
      title: "2. Use of the Service",
      icon: "⚙️",
      text:
        "You agree to use NutriGen Bot only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the service."
    },
    {
      title: "3. Account Responsibility",
      icon: "🔐",
      text:
        "You are responsible for maintaining the confidentiality of your account and password. NutriGen Bot is not liable for any loss or damage from your failure to comply with this obligation."
    },
    {
      title: "4. Changes to Terms",
      icon: "🔄",
      text:
        "We may modify these terms at any time. Continued use of the service after changes will be considered acceptance of those changes."
    },
    {
      title: "5. Termination",
      icon: "🚫",
      text:
        "We reserve the right to suspend or terminate your access to NutriGen Bot at our discretion, without prior notice or liability."
    },
    {
      title: "6. Contact Us",
      icon: "✉️",
      text:
        "If you have any questions about these Terms, please contact us through the support page."
    }
  ];

  return (
    <Layout>
      <main className="bg-[#f8f3e7] px-4 md:px-16 py-16 text-gray-800">
        <div className={`max-w-4xl mx-auto transition-opacity duration-700 ease-in ${show ? 'opacity-100' : 'opacity-0'}`}> 
          <h1 className="text-4xl font-bold mb-12 text-gray-900">Terms of Service</h1>

          {sections.map((item, index) => (
            <section
              key={index}
              className={`mb-10 border-l-4 border-[#4b7e53] pl-4 transform transition-all duration-700 ease-in-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
              <h2 className="text-2xl font-semibold mb-3 hover:underline cursor-pointer flex items-center gap-2">
                <span className="text-xl">{item.icon}</span> {item.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">{item.text}</p>
            </section>
          ))}
        </div>
      </main>
    </Layout>
  );
}