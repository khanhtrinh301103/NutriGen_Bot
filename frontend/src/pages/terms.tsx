import Layout from "./components/common/layout";
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';

export default function TermsOfService() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const sections = [
    { title: "1. Acceptance of Terms", icon: "📘", text: "By accessing or using NutriGen Bot, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service." },
    { title: "2. Use of the Service", icon: "⚙️", text: "You agree to use NutriGen Bot only for lawful purposes and in a way that does not infringe the rights of others or restrict their use and enjoyment of the service." },
    { title: "3. Account Responsibility", icon: "🔐", text: "You are responsible for maintaining the confidentiality of your account and password. NutriGen Bot is not liable for any loss or damage from your failure to comply with this obligation." },
    { title: "4. Changes to Terms", icon: "🔄", text: "We may modify these terms at any time. Continued use of the service after changes will be considered acceptance of those changes." },
    { title: "5. Termination", icon: "🚫", text: "We reserve the right to suspend or terminate your access to NutriGen Bot at our discretion, without prior notice or liability." },
    { title: "6. Contact Us", icon: "✉️", text: "If you have any questions about these Terms, please contact us through the support page." }
  ];

  return (
    <Layout>
      <main className="bg-[#f8f3e7] text-gray-900 px-4 sm:px-6 lg:px-8 py-16">
        <div className={`max-w-4xl mx-auto transition-opacity duration-700 ${show ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl font-bold mb-12 text-gray-900 drop-shadow-md">Terms of Service</h1>

          {sections.map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className={`mb-10 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#eae3db]'}`}
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4b7e53] text-white text-xl mr-3">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">{section.text}</p>
            </motion.section>
          ))}
        </div>
      </main>
    </Layout>
  );
}
