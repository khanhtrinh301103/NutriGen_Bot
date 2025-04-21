import Layout from "./components/common/layout";
import { useEffect, useState } from "react";

export default function PrivacyPolicy() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const sections = [
    {
      title: "1. Information Collection",
      icon: "📝",
      text:
        "We collect personal information such as your name, email, and health data to personalize your experience with NutriGen Bot. This information is provided directly by you during signup and profile creation."
    },
    {
      title: "2. Use of Information",
      icon: "📊",
      text:
        "The collected information is used to provide personalized meal recommendations, maintain user profiles, and improve the service experience. We do not sell your data to third parties."
    },
    {
      title: "3. Data Storage",
      icon: "💾",
      text:
        "Your information is securely stored in our database and managed through Firebase services. We implement appropriate security measures to protect your data."
    },
    {
      title: "4. Cookies",
      icon: "🍪",
      text:
        "NutriGen Bot uses cookies to enhance user experience and track anonymous usage analytics. You may disable cookies in your browser settings."
    },
    {
      title: "5. Third-Party Services",
      icon: "🔗",
      text:
        "We may use third-party services such as analytics and hosting providers. These services are bound by their own privacy policies."
    },
    {
      title: "6. Contact Us",
      icon: "📩",
      text:
        "For any questions or concerns about this Privacy Policy, please reach out to our support team."
    }
  ];

  return (
    <Layout>
      <main className="bg-[#f8f3e7] px-4 md:px-16 py-16 text-gray-800">
        <div className={`max-w-4xl mx-auto transition-opacity duration-700 ease-in ${show ? 'opacity-100' : 'opacity-0'}`}> 
          <h1 className="text-4xl font-bold mb-12 text-gray-900">Privacy Policy</h1>

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
