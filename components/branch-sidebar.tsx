"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  FilePlus,
  User,
  Settings,
  Users,
  CreditCardIcon,
} from "lucide-react";
import { de } from "date-fns/locale";
import { jwtDecode } from "jwt-decode";
interface DecodedToken {
  role: string;
  userId?: string;
  branchId?: string;
  [key: string]: any;
}

function SideBarIcon({
  icon,
  text,
}: {
  icon: React.ReactElement;
  text: string;
}) {
  const pathname = usePathname();
  const href = (() => {
    if (text === "Staffs") {
      return "/branch/staffs";
    } else if (text === "Create Order") {
      return "/branch/orders";
    } else if (text === "View Orders") {
      return "/branch/orders";
    } else if (text === "Profile") {
      return "/branch";
    } else {
      return `/branch/${text.toLowerCase()}`;
    }
  })();
  const modifiedHref = href === "/" ? "/" : href;

  return (
    <Link href={modifiedHref}>
      <div
        className={`relative flex items-center justify-center h-12 w-12 my-2 mx-auto transition-colors duration-300 ease-linear cursor-pointer group rounded-xl text-zinc-900 bg-white ${
          pathname === modifiedHref
            ? "border-2 border-zinc-900"
            : "hover:border-2 hover:border-zinc-400"
        }`}
      >
        {icon}
        <span className="absolute w-auto p-2 m-2 min-w-max left-14 rounded-md shadow-md text-white bg-zinc-900 text-xs font-bold z-50 transition-all duration-100 origin-left scale-0 group-hover:scale-100">
          {text}
        </span>
      </div>
    </Link>
  );
}

function SiderBarBranch() {
  const [decodedToken, setDecodedToken] = React.useState<DecodedToken | null>(
    null
  );
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token) as DecodedToken;
      setDecodedToken(decodedToken);
    }
  }, []);
  return (
    <React.Fragment>
      <button
        data-drawer-target="sidebar"
        data-drawer-toggle="sidebar"
        aria-controls="sidebar"
        type="button"
        className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
      >
        <svg
          className="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>

      <aside
        id="sidebar"
        className="fixed top-0 left-0 w-16 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="sidebar"
      >
        <div className={`h-full px-2 bg-white text-white flex flex-col border-r-2 ${decodedToken?.role === 'owner' ? 'hidden': 'flex'}`} >
          {/* Logo here */}
          <ul className="space-y-5 font-medium">
            <li>
              <SideBarIcon icon={<Home className="w-5 h-5" />} text={decodedToken?.branchId?.toString() ?? ''} />
            </li>
          </ul>
          <ul className="pt-2 mt-2 space-y-5 font-medium border-t-2">
            <li>
              <SideBarIcon
                icon={<ClipboardList className="w-5 h-5" />}
                text="View Orders"
              />
            </li>
            <li>
              <SideBarIcon
                icon={<CreditCardIcon className="w-5 h-5" />}
                text="Expenses"
              />
            </li>
            {true? (
              <li>
                <SideBarIcon
                  icon={<Users className="w-5 h-5" />}
                  text="Staffs"
                />
              </li>
            ) : null}

            {true? (
              <li>
                <SideBarIcon
                  icon={<User className="w-5 h-5" />}
                  text="Profile"
                />
              </li>
            ) : null}
          </ul>
          <ul className="pt-2 mt-auto font-medium border-t-2">
            <li>
              <SideBarIcon
                icon={<Settings className="w-5 h-5" />}
                text="Settings"
              />
            </li>
          </ul>
        </div>
        
      </aside>
    </React.Fragment>
  );
}

export default SiderBarBranch;
