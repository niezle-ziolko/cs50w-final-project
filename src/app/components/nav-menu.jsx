"use client";
import Link from "next/link";

import { useAuth } from "context/auth-context";
import { useTheme } from "context/theme-context";

export default function NavMenu() {
  const { user, logoutUser } = useAuth();
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <div className="flex gap-4 md:gap-13 items-center">
      <ul className="p-0 flex gap-2 md:gap-13 text-xl items-center text-primary">
        {user ? (
          <>
            <li className="u12">
              <Link href="/auth/library" aria-label="library-page">Library</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <Link href="/auth/create-book" aria-label="library-page">Create</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <Link href="/auth/my-account" aria-label="account-page">My account</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <button onClick={logoutUser} aria-label="logout-page">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li className="u12">
              <Link href="/auth/login" aria-label="login-page">Sign in</Link>
            </li>
            <li className="u13">
              |
            </li>
            <li className="u12">
              <Link href="/auth/register" aria-label="register-page">Sign up</Link>
            </li>
          </>
        )}
      </ul>
      <div>
        <label className="relative cursor-pointer inline-block w-11 h-7 align-middle select-none" aria-label="switch-theme">
          <input type="checkbox" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} className="sr-only peer" />
          <div className="w-full h-4 bg-secondary rounded-full border-2 border-primary" />
          <div className="absolute left-s bottom-2 w-4 h-4 bg-secondary rounded-full border-2 border-primary transition transform peer-checked:translate-x-4 peer-hover:translate-y-[-1px] shadow-[0_2px_0_0_var(--color-primary)]" />
        </label>
      </div>
    </div>
  );
};