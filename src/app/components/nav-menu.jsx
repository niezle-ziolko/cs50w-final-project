"use client";
import Link from "next/link";

import { useAuth } from "context/auth-context";
import { useTheme } from "context/theme-context";

export default function NavMenu() {
  const { user, logoutUser } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <div className="flex gap-4 md:gap-13 items-center">
      <ul className="p-0 flex gap-3 md:gap-13 text-xl items-center text-primary">
        {user ? (
          <>
            <li className="u12">
              <Link className="u14" href="/auth/library" aria-label="library-page"><i className="fa-solid fa-book" /></Link>
              <Link className="u15" href="/auth/library" aria-label="library-page">Library</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <Link className="u14" href="/auth/create-book" aria-label="create-page"><i className="fa-solid fa-pen-fancy" /></Link>
              <Link className="u15" href="/auth/create-book" aria-label="create-page">Create</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <Link className="u14" href="/auth/my-account" aria-label="account-page"><i className="fa-solid fa-user" /></Link>
              <Link className="u15" href="/auth/my-account" aria-label="account-page">My account</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <button className="text-xs px-1 py-1 md:text-base md:px-7 md:py-2 w-full h-full" onClick={logoutUser} aria-label="logout-page">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li className="u12">
              <Link className="u14" href="/auth/login" aria-label="login-page"><i className="fa-solid fa-user" /></Link>
              <Link className="u15" href="/auth/login" aria-label="login-page">Sign in</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <Link className="u14" href="/auth/register" aria-label="register-page"><i className="fa-solid fa-user-plus" /></Link>
              <Link className="u15" href="/auth/register" aria-label="register-page">Sign up</Link>
            </li>
          </>
        )}
      </ul>
      <div>
        <label className="relative cursor-pointer inline-block w-11 h-7 align-middle select-none" aria-label="switch-theme">
          <input name="theme-button" type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} className="sr-only peer" />
          <div className="w-full h-4 bg-secondary rounded-full border-2 border-primary" />
          <div className="absolute left-s bottom-2 w-4 h-4 bg-secondary rounded-full border-2 border-primary transition transform peer-checked:translate-x-4 peer-hover:translate-y-[-1px] shadow-[0_2px_0_0_var(--color-primary)]" />
        </label>
      </div>
    </div>
  );
};