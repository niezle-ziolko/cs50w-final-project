"use client";
import Link from "next/link";

import { useAuth } from "context/auth-context";

import Switch from "./buttons/switch";
import LogoIcon from "styles/icons/logo";

import "styles/css/header/theme.css";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="element">
        <div className="box">
          <div>
            <Link href="/">
              <LogoIcon />
            </Link>
          </div>
          {user && user.photo ? (
            <img className="picture" src={user.photo} alt="profile-picture" width="70" height="70" />
          ) : null}
        </div>
        <div className="box">
          <div className="menu">
            <Switch />
          </div>
        </div>
      </div>
    </header>
  );
};