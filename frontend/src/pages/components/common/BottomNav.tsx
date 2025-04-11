import Link from "next/link";
import { useRouter } from "next/router";
import {
    HomeIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    InformationCircleIcon,
} from "@heroicons/react/24/solid";

const BottomNav = () => {
  const router = useRouter();

  const navItems = [
    { name: "Home", path: "/", icon: <HomeIcon className="h-6 w-6" /> },
    { name: "Recipe", path: "/recipes", icon: <MagnifyingGlassIcon className="h-6 w-6" /> },
    { name: "Blog", path: "/blog", icon: <ChatBubbleLeftRightIcon className="h-6 w-6" /> },
    { name: "About", path: "/about", icon: <InformationCircleIcon className="h-6 w-6" /> },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-6 py-2 flex justify-between items-center w-[90%] max-w-md md:hidden z-50">
      {navItems.map((item) => {
        const isActive = router.pathname === item.path;

        return (
          <Link key={item.path} href={item.path} className="relative flex-1">
            <div
              className={`flex flex-col items-center text-sm transition-all duration-500 ease-out ${
                isActive ? "text-[#4b7e53] font-semibold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-500 ease-out transform
                  ${isActive
                    ? "bg-white shadow-xl -translate-y-6 z-10 scale-125 rotate-[6deg]"
                    : "hover:scale-110 hover:-translate-y-1.5 hover:rotate-[3deg]"}`}
              >
                {item.icon}
              </div>
              {!isActive && <span className="text-xs mt-1">{item.name}</span>}
              {isActive && (
                <span className="absolute top-14 text-xs text-[#4b7e53]">
                  {item.name}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
