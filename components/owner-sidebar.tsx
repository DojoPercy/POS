"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, Building2, Users, Settings, ClipboardList, User, X, LogOutIcon } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { fetchUserFromToken, logoutUser, selectUser } from "@/redux/authSlice";
import { getCompanyDetails } from "@/redux/companySlice";
import { RootState } from "@/redux";import { useRouter } from "next/navigation"

function SideBarIcon({
  icon,
  text,
  onClick,
}: {
  icon: React.ReactElement;
  text: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const href = text === "Home" ? "/" : `/owner/${text.toLowerCase()}`;
  const modifiedHref = href === "/" ? "/" : href;
 

  return (
    <Link href={modifiedHref} onClick={onClick}>
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

function SideBarOwner() {
  const [hasCompanies, setHasCompanies] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch()
  const user = useSelector(selectUser)

  const router = useRouter()
  const { company } = useSelector((state: RootState) => state.company)
  

  useEffect(() => {
    if (user?.companyId) {
      
      console.log("user companyId:", user.companyId)
      Promise.all([
        dispatch(fetchUserFromToken()),
        dispatch(getCompanyDetails(user.companyId)),
       
      ]).finally(() => {
        setHasCompanies(true);
      })
    }
  }, [dispatch, user?.companyId])
 

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const logout = async () => {
    await dispatch(logoutUser());
    router.push("/login")
  }

  return (
    <React.Fragment>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        type="button"
        className="fixed bg-white top-4 left-4 z-40 inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
        aria-controls="sidebar"
        aria-expanded={isMobileMenuOpen}
      >
        <span className="sr-only">Open sidebar</span>
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
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
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Sidebar for both mobile and desktop */}
      <aside
        id="sidebar"
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 w-16`}
        aria-label="sidebar"
      >
        <div className="h-full px-2 py-4 bg-white text-white flex flex-col border-r-2 overflow-y-auto">
          {/* logo here */}
          {hasCompanies ? (
            <>
              <ul className="space-y-5 font-medium">
                <li>
                  <SideBarIcon 
                    icon={<Home className="w-5 h-5" />} 
                    text="Home" 
                    onClick={closeMobileMenu}
                  />
                </li>
              </ul>
              <ul className="pt-2 mt-2 space-y-5 font-medium border-t-2">
                <li>
                  <SideBarIcon 
                    icon={<Menu className="w-5 h-5" />} 
                    text="Menu" 
                    onClick={closeMobileMenu}
                  />
                </li>
                <li>
                  <SideBarIcon
                    icon={<Building2 className="w-5 h-5" />}
                    text="Branches"
                    onClick={closeMobileMenu}
                  />
                </li>
                <li>
                  <SideBarIcon
                    icon={<ClipboardList className="w-5 h-5" />}
                    text="Orders"
                    onClick={closeMobileMenu}
                  />
                </li>
                <li>
                  <SideBarIcon 
                    icon={<Users className="w-5 h-5" />} 
                    text="Staffs" 
                    onClick={closeMobileMenu}
                  />
                </li>
                <li>
                  <SideBarIcon 
                    icon={<User className="w-5 h-5" />} 
                    text="Profile" 
                    onClick={closeMobileMenu}
                  />
                </li>
              </ul>
              <div className="flex-grow"></div>
        <div className=" bg-white text-white flex flex-col border-t-2">
          <ul className="space-y-5 font-medium">
            <li>
              <SideBarIcon 
                icon={<Settings className="w-5 h-5" />} 
                text="Settings" 
                onClick={closeMobileMenu}
              />
            </li>
            <li>
              <button
                onClick={logout}
                className="flex items-center justify-center h-12 w-12 my-2 mx-auto transition-colors duration-300 ease-linear cursor-pointer group rounded-xl text-zinc-900 bg-white hover:border-2 hover:border-zinc-400"
              >
                <LogOutIcon className="w-5 h-5" />
              </button>
            </li>
          </ul>
        </div>
            </>
          ) : (
            <ul>
              <li>
                <SideBarIcon 
                  icon={<User className="w-5 h-5" />} 
                  text="Profile" 
                  onClick={closeMobileMenu}
                />
              </li>
            </ul>
          )}
        </div>
    
      </aside>
    </React.Fragment>
  );
}

export default SideBarOwner;
