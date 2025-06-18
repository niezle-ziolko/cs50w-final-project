"use client";
import Link from "next/link";

import { useAuth } from "context/auth-context";

import NavMenu from "./nav-menu";
import LogoIcon from "styles/icons/logo";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="mb-0 md:mb-5 py-4 px-5">
      <div className="py-0 px-0 md:px-8 flex justify-between border-b-2 border-b-primary">
        <div className="u11">
          <div>
            <Link href="/" aria-label="home-page">
              <LogoIcon />
            </Link>
          </div>
          {user && user.photo ? (
            <img className="hidden md:block rounded-full border-primary border-2" src={user.photo} alt="profile-picture" width="70" height="70" />
          ) : null}
        </div>
        <div className="u11">
          <div className="flex h-full text-center items-center">
            <NavMenu />
          </div>
        </div>
      </div>
    </header>
  );
};