"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";

type AppShellProps = {
  profileId: string;
  profileName: string;
  profileColor?: string | null;
  avatarUrl?: string | null;
  children: ReactNode;
};

type IconProps = {
  size?: number;
};

function TodayIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <path d="M8 2v4M16 2v4M3 9h18" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function ProgressIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19H2" />
    </svg>
  );
}

function TrainingIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 7v10" />
      <path d="M18 7v10" />
      <path d="M3 9v6" />
      <path d="M21 9v6" />
      <path d="M6 12h12" />
    </svg>
  );
}

function CardioIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </svg>
  );
}

function HabitsIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </svg>
  );
}

function SettingsIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  );
}

function SwitchProfileIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 18c.7-3 2.5-4.5 5.5-4.5 2 0 3.5.7 4.4 2" />
      <path d="M16 7h5l-2-2" />
      <path d="m21 7-2 2" />
      <path d="M21 17h-5l2 2" />
      <path d="m16 17 2-2" />
    </svg>
  );
}

function CollapseIcon({ size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m14 7-5 5 5 5" />
    </svg>
  );
}

function ChevronIcon({ size = 14 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function AppShell({
  profileId,
  profileName,
  profileColor = "#6f8cff",
  avatarUrl,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const base = `/profile/${profileId}`;

  const navigation = [
    {
      label: "Hoy",
      href: base,
      icon: TodayIcon,
    },
    {
      label: "Progreso",
      href: `${base}/progress`,
      icon: ProgressIcon,
    },
    {
      label: "Entreno",
      href: `${base}/training`,
      icon: TrainingIcon,
    },
    {
      label: "Cardio",
      href: `${base}/cardio`,
      icon: CardioIcon,
    },
    {
      label: "Hábitos",
      href: `${base}/habits`,
      icon: HabitsIcon,
    },
  ];

  function isActive(href: string) {
    if (href === base) {
      return pathname === base;
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          collapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <div className="sidebar-top">
          <div className="logo-row">
            <Link href={base} className="brand">
              <span className="brand-mark">F</span>

              <span className="brand-text">
                Fitness
              </span>
            </Link>

            <button
              type="button"
              className="collapse-button"
              onClick={() =>
                setCollapsed((current) => !current)
              }
              aria-label={
                collapsed
                  ? "Expandir barra lateral"
                  : "Contraer barra lateral"
              }
            >
              <span
                className={`collapse-icon ${
                  collapsed ? "rotated" : ""
                }`}
              >
                <CollapseIcon />
              </span>
            </button>
          </div>

          <Link
            href="/"
            className="profile-switcher"
            title="Cambiar perfil"
          >
            <span
              className="profile-avatar"
              style={{
                background:
                  profileColor || "#6f8cff",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profileName}
                />
              ) : (
                profileName
                  .trim()
                  .slice(0, 1)
                  .toUpperCase()
              )}
            </span>

            <span className="profile-copy">
              <span className="profile-label">
                PERFIL
              </span>

              <span className="profile-name">
                {profileName}
              </span>
            </span>

            <span className="profile-chevron">
              <ChevronIcon />
            </span>
          </Link>
        </div>

        <div className="nav-section">
          <span className="nav-heading">
            PRINCIPAL
          </span>

          <nav className="nav-list">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${
                    active ? "active" : ""
                  }`}
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                >
                  <span className="nav-icon">
                    <Icon />
                  </span>

                  <span className="nav-label">
                    {item.label}
                  </span>

                  {active && (
                    <span className="active-dot" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <Link
            href={`${base}/settings`}
            className={`footer-item ${
              pathname.startsWith(
                `${base}/settings`
              )
                ? "active"
                : ""
            }`}
            title={
              collapsed ? "Ajustes" : undefined
            }
          >
            <span className="nav-icon">
              <SettingsIcon />
            </span>

            <span className="nav-label">
              Ajustes
            </span>
          </Link>

          <Link
            href="/"
            className="footer-item"
            title={
              collapsed
                ? "Cambiar perfil"
                : undefined
            }
          >
            <span className="nav-icon">
              <SwitchProfileIcon />
            </span>

            <span className="nav-label">
              Cambiar perfil
            </span>
          </Link>

          <div className="version-row">
            <span className="version-dot" />
            <span className="version-text">
              Proyecto Fitness · v0.1
            </span>
          </div>
        </div>
      </aside>

      <main className="content">
        {children}
      </main>

      <nav className="mobile-nav">
        {navigation.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-nav-item ${
                active ? "active" : ""
              }`}
            >
              <span className="mobile-icon">
                <Icon size={17} />
              </span>

              <span className="mobile-label">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <style jsx>{`
        .app-shell {
          min-height: 100vh;
          display: flex;
          background: #0c0c0e;
          color: #f2f2f3;
        }

        .sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          z-index: 50;

          width: 224px;
          height: 100vh;

          display: flex;
          flex-direction: column;

          padding: 10px;

          border-right:
            1px solid rgba(255, 255, 255, 0.055);

          background:
            rgba(15, 15, 18, 0.97);

          transition:
            width 280ms cubic-bezier(
              0.23,
              1,
              0.32,
              1
            );
        }

        .sidebar-collapsed {
          width: 54px;
        }

        .sidebar-top {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .logo-row {
          height: 34px;

          display: flex;
          align-items: center;

          overflow: hidden;
        }

        .brand {
          min-width: 0;
          flex: 1;

          display: flex;
          align-items: center;
          gap: 8px;

          overflow: hidden;
        }

        .brand-mark {
          width: 28px;
          height: 28px;
          flex: 0 0 28px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #eeeeef;
          color: #111113;

          font-size: 11px;
          font-weight: 750;

          box-shadow:
            0 0 0 1px
              rgba(255,255,255,.08),
            0 2px 8px
              rgba(0,0,0,.2);
        }

        .brand-text {
          color: #e0e0e3;

          font-size: 12.5px;
          font-weight: 620;

          letter-spacing: -.015em;

          white-space: nowrap;

          opacity: 1;
          transform: translateX(0);

          transition:
            opacity 160ms ease,
            transform 220ms
              cubic-bezier(.23,1,.32,1);
        }

        .collapse-button {
          width: 26px;
          height: 26px;
          flex: 0 0 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border: 0;
          border-radius: 7px;

          background: transparent;
          color: #5d5d66;

          transition:
            color 130ms ease,
            background-color 130ms ease;
        }

        .collapse-button:hover {
          background: #19191d;
          color: #a5a5ad;
        }

        .collapse-icon {
          display: flex;

          transition:
            transform 280ms
              cubic-bezier(.23,1,.32,1);
        }

        .collapse-icon.rotated {
          transform: rotate(180deg);
        }

        .profile-switcher {
          position: relative;

          height: 50px;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 6px;

          overflow: hidden;

          border: 1px solid
            rgba(255,255,255,.055);
          border-radius: 11px;

          background: #141417;

          transition:
            background-color 130ms ease,
            border-color 130ms ease;
        }

        .profile-switcher:hover {
          background: #18181c;
          border-color:
            rgba(255,255,255,.085);
        }

        .profile-avatar {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 9px;

          color: #fff;

          font-size: 12px;
          font-weight: 650;

          box-shadow:
            0 0 0 1px
              rgba(255,255,255,.09)
              inset;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-copy {
          min-width: 0;
          flex: 1;

          display: flex;
          flex-direction: column;
          gap: 2px;

          opacity: 1;

          transition:
            opacity 150ms ease;
        }

        .profile-label {
          color: #55555e;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: .12em;
        }

        .profile-name {
          overflow: hidden;

          color: #d8d8dc;

          font-size: 11.5px;
          font-weight: 560;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-chevron {
          display: flex;

          color: #4f4f57;

          transition:
            color 130ms ease,
            transform 130ms ease;
        }

        .profile-switcher:hover
          .profile-chevron {
          color: #8d8d96;
          transform: translateX(1px);
        }

        .nav-section {
          margin-top: 20px;
        }

        .nav-heading {
          display: block;

          margin: 0 8px 7px;

          color: #484850;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: .13em;

          white-space: nowrap;

          transition:
            opacity 150ms ease;
        }

        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-item,
        .footer-item {
          position: relative;

          height: 34px;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 0 8px;

          overflow: hidden;

          border-radius: 8px;

          color: #74747e;

          transition:
            background-color 130ms ease,
            color 130ms ease,
            transform 120ms ease;
        }

        .nav-item:hover,
        .footer-item:hover {
          background: #17171a;
          color: #b7b7be;
        }

        .nav-item:active,
        .footer-item:active {
          transform: scale(.985);
        }

        .nav-item.active,
        .footer-item.active {
          background: #1a1a1e;
          color: #ededee;
        }

        .nav-item.active::before {
          content: "";

          position: absolute;
          left: 0;

          width: 2px;
          height: 14px;

          border-radius: 0 3px 3px 0;

          background: #6f8cff;
        }

        .nav-icon {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-label {
          min-width: 0;

          font-size: 11.5px;
          font-weight: 520;

          white-space: nowrap;

          opacity: 1;
          transform: translateX(0);

          transition:
            opacity 150ms ease,
            transform 220ms
              cubic-bezier(.23,1,.32,1);
        }

        .active-dot {
          width: 4px;
          height: 4px;

          margin-left: auto;

          border-radius: 999px;

          background: #6f8cff;

          box-shadow:
            0 0 7px
              rgba(111,140,255,.4);
        }

        .sidebar-spacer {
          flex: 1;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .version-row {
          height: 31px;

          display: flex;
          align-items: center;
          gap: 6px;

          padding: 0 8px;

          overflow: hidden;
        }

        .version-dot {
          width: 5px;
          height: 5px;
          flex: 0 0 5px;

          border-radius: 50%;

          background: #3caf7d;
        }

        .version-text {
          color: #424249;

          font-size: 8.5px;

          white-space: nowrap;

          transition:
            opacity 150ms ease;
        }

        .sidebar-collapsed
          .brand-text,
        .sidebar-collapsed
          .profile-copy,
        .sidebar-collapsed
          .profile-chevron,
        .sidebar-collapsed
          .nav-heading,
        .sidebar-collapsed
          .nav-label,
        .sidebar-collapsed
          .active-dot,
        .sidebar-collapsed
          .version-text {
          opacity: 0;
          pointer-events: none;
        }

        .sidebar-collapsed
          .brand-text,
        .sidebar-collapsed
          .nav-label {
          transform: translateX(-5px);
        }

        .sidebar-collapsed
          .collapse-button {
          display: none;
        }

        .sidebar-collapsed
          .profile-switcher {
          padding: 5px 0;

          justify-content: center;

          border-color: transparent;
          background: transparent;
        }

        .sidebar-collapsed
          .profile-avatar {
          width: 32px;
          height: 32px;
          flex-basis: 32px;
        }

        .sidebar-collapsed
          .nav-item,
        .sidebar-collapsed
          .footer-item {
          justify-content: center;
          padding: 0;
        }

        .sidebar-collapsed
          .nav-item.active::before {
          left: -1px;
        }

        .sidebar-collapsed
          .version-row {
          justify-content: center;
          padding: 0;
        }

        .content {
          width: 100%;
          min-width: 0;

          margin-left: 224px;

          transition:
            margin-left 280ms
              cubic-bezier(.23,1,.32,1);
        }

        .sidebar-collapsed + .content {
          margin-left: 54px;
        }

        .mobile-nav {
          display: none;
        }

        @media (max-width: 720px) {
          .sidebar {
            display: none;
          }

          .content,
          .sidebar-collapsed + .content {
            margin-left: 0;
          }

          .content {
            padding-bottom: 76px;
          }

          .mobile-nav {
            position: fixed;
            z-index: 100;

            left: 10px;
            right: 10px;
            bottom: 10px;

            height: 58px;

            display: grid;
            grid-template-columns:
              repeat(5, 1fr);

            padding: 5px;

            border:
              1px solid
              rgba(255,255,255,.075);

            border-radius: 16px;

            background:
              rgba(18,18,21,.94);

            box-shadow:
              0 12px 35px
                rgba(0,0,0,.42),
              0 1px 0
                rgba(255,255,255,.035)
                inset;

            backdrop-filter: blur(18px);
            -webkit-backdrop-filter:
              blur(18px);
          }

          .mobile-nav-item {
            position: relative;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;

            border-radius: 11px;

            color: #5f5f68;

            transition:
              background-color 130ms ease,
              color 130ms ease,
              transform 120ms ease;
          }

          .mobile-nav-item:active {
            transform: scale(.94);
          }

          .mobile-nav-item.active {
            background: #1c1c21;
            color: #ededee;
          }

          .mobile-nav-item.active::before {
            content: "";

            position: absolute;
            top: 4px;

            width: 14px;
            height: 2px;

            border-radius: 999px;

            background: #6f8cff;
          }

          .mobile-icon {
            height: 19px;

            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-label {
            font-size: 8.5px;
            font-weight: 560;
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .sidebar,
          .content,
          .collapse-icon,
          .brand-text,
          .nav-label {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
