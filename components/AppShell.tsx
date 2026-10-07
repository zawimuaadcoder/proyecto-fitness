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

function HomeIcon({ size = 15 }: IconProps) {
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
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8 2v4M16 2v4M4 9h16" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  );
}

function ProgressIcon({ size = 15 }: IconProps) {
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
      <path d="M5 19V11" />
      <path d="M10 19V6" />
      <path d="M15 19v-4" />
      <path d="M20 19V9" />
      <path d="M3 19h18" />
    </svg>
  );
}

function TrainingIcon({ size = 15 }: IconProps) {
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
      <path d="M7 8v8M17 8v8" />
      <path d="M4 10v4M20 10v4" />
      <path d="M7 12h10" />
    </svg>
  );
}

function CardioIcon({ size = 15 }: IconProps) {
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

function HabitsIcon({ size = 15 }: IconProps) {
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

function SettingsIcon({ size = 15 }: IconProps) {
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
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5L9 6.1a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L5 11a7 7 0 0 0 0 2l-2.1 1.5 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.5 3.1h5l.5-3.1a7 7 0 0 0 1.7-1l2.4 1 2-3.4L19 13a7 7 0 0 0 .1-1Z" />
    </svg>
  );
}

function SwitchIcon({ size = 15 }: IconProps) {
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
      <path d="M7 7h11l-3-3" />
      <path d="m18 7-3 3" />
      <path d="M17 17H6l3 3" />
      <path d="m6 17 3-3" />
    </svg>
  );
}

function ChevronLeft({ size = 14 }: IconProps) {
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
      <path d="m14 7-5 5 5 5" />
    </svg>
  );
}

function ChevronDown({ size = 13 }: IconProps) {
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
      <path d="m6 9 6 6 6-6" />
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
      icon: HomeIcon,
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

  function active(href: string) {
    if (href === base) {
      return pathname === base;
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          collapsed ? "collapsed" : ""
        }`}
      >
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-logo">F</span>

            <span className="brand-name">
              Fitness
            </span>
          </div>

          <button
            type="button"
            className="collapse-btn"
            onClick={() =>
              setCollapsed((value) => !value)
            }
            aria-label="Contraer sidebar"
          >
            <span
              className={
                collapsed
                  ? "collapse-arrow flipped"
                  : "collapse-arrow"
              }
            >
              <ChevronLeft />
            </span>
          </button>
        </div>

        <Link
          href="/"
          className="profile-card"
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

          <span className="profile-data">
            <span className="profile-overline">
              PERFIL
            </span>

            <span className="profile-name">
              {profileName}
            </span>
          </span>

          <span className="profile-arrow">
            <ChevronDown />
          </span>
        </Link>

        <div className="nav-block">
          <span className="nav-title">
            PRINCIPAL
          </span>

          <nav className="nav-list">
            {navigation.map((item) => {
              const Icon = item.icon;
              const selected = active(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={
                    collapsed
                      ? item.label
                      : undefined
                  }
                  className={`nav-row ${
                    selected ? "selected" : ""
                  }`}
                >
                  <span className="nav-icon">
                    <Icon />
                  </span>

                  <span className="nav-text">
                    {item.label}
                  </span>

                  {selected && (
                    <span className="nav-selected-dot" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-space" />

        <div className="sidebar-bottom">
          <Link
            href={`${base}/settings`}
            className={`nav-row ${
              pathname.startsWith(
                `${base}/settings`
              )
                ? "selected"
                : ""
            }`}
          >
            <span className="nav-icon">
              <SettingsIcon />
            </span>

            <span className="nav-text">
              Ajustes
            </span>
          </Link>

          <Link
            href="/"
            className="nav-row"
          >
            <span className="nav-icon">
              <SwitchIcon />
            </span>

            <span className="nav-text">
              Cambiar perfil
            </span>
          </Link>

          <div className="sidebar-status">
            <span className="status-dot" />

            <span className="status-text">
              Sincronizado
            </span>
          </div>
        </div>
      </aside>

      <main
        className={`app-content ${
          collapsed ? "content-collapsed" : ""
        }`}
      >
        {children}
      </main>

      <nav className="mobile-navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const selected = active(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-item ${
                selected ? "selected" : ""
              }`}
            >
              <span className="mobile-icon">
                <Icon size={17} />
              </span>

              <span className="mobile-text">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        .app-shell {
          min-height: 100vh;
          background: #0c0c0e;
          color: #f3f3f4;
        }

        .sidebar {
          position: fixed;
          z-index: 50;
          top: 0;
          bottom: 0;
          left: 0;

          width: 220px;

          display: flex;
          flex-direction: column;

          padding: 12px 10px 11px;

          background: #0f0f12;

          border-right:
            1px solid rgba(255,255,255,.055);

          transition:
            width 280ms
            cubic-bezier(.23,1,.32,1);
        }

        .sidebar-header {
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 4px;

          margin-bottom: 10px;
        }

        .brand {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 9px;

          overflow: hidden;
        }

        .brand-logo {
          width: 26px;
          height: 26px;

          flex: 0 0 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;

          background: #ededee;
          color: #101012;

          font-size: 10px;
          font-weight: 750;

          box-shadow:
            0 1px 0 rgba(255,255,255,.35) inset,
            0 1px 5px rgba(0,0,0,.24);
        }

        .brand-name {
          color: #d7d7db;

          font-size: 12px;
          font-weight: 620;

          letter-spacing: -.015em;

          white-space: nowrap;

          transition:
            opacity 130ms ease,
            transform 200ms ease;
        }

        .collapse-btn {
          width: 26px;
          height: 26px;

          flex: 0 0 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;

          border-radius: 7px;

          padding: 0;

          background: transparent;

          color: #53535c;
        }

        .collapse-btn:hover {
          background: #18181c;
          color: #95959d;
        }

        .collapse-arrow {
          display: flex;

          transition:
            transform 260ms
            cubic-bezier(.23,1,.32,1);
        }

        .collapse-arrow.flipped {
          transform: rotate(180deg);
        }

        .profile-card {
          min-width: 0;
          height: 48px;

          display: flex;
          flex-direction: row;
          align-items: center;

          gap: 9px;

          padding: 6px;

          overflow: hidden;

          border:
            1px solid rgba(255,255,255,.055);

          border-radius: 10px;

          background: #141417;

          transition:
            background-color 120ms ease,
            border-color 120ms ease;
        }

        .profile-card:hover {
          background: #18181c;

          border-color:
            rgba(255,255,255,.08);
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

          color: white;

          font-size: 12px;
          font-weight: 650;

          box-shadow:
            0 0 0 1px
            rgba(255,255,255,.08)
            inset;
        }

        .profile-avatar img {
          width: 100%;
          height: 100%;

          object-fit: cover;
        }

        .profile-data {
          min-width: 0;
          flex: 1;

          display: flex;
          flex-direction: column;

          gap: 1px;

          overflow: hidden;
        }

        .profile-overline {
          color: #52525a;

          font-size: 7.5px;
          font-weight: 700;

          letter-spacing: .12em;
        }

        .profile-name {
          overflow: hidden;

          color: #d6d6da;

          font-size: 11px;
          font-weight: 560;

          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-arrow {
          width: 18px;

          flex: 0 0 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #55555d;
        }

        .nav-block {
          margin-top: 20px;
        }

        .nav-title {
          display: block;

          height: 20px;

          padding: 0 8px;

          color: #44444c;

          font-size: 7.5px;
          font-weight: 700;

          letter-spacing: .13em;

          white-space: nowrap;
        }

        .nav-list {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .nav-row {
          position: relative;

          width: 100%;
          height: 34px;

          display: flex;
          flex-direction: row;
          align-items: center;

          gap: 9px;

          padding: 0 8px;

          overflow: hidden;

          border-radius: 8px;

          color: #71717a;

          transition:
            background-color 120ms ease,
            color 120ms ease;
        }

        .nav-row:hover {
          background: #16161a;
          color: #b7b7bd;
        }

        .nav-row.selected {
          background: #19191d;
          color: #eeeeef;
        }

        .nav-row.selected::before {
          content: "";

          position: absolute;

          left: 0;
          top: 9px;

          width: 2px;
          height: 16px;

          border-radius: 0 2px 2px 0;

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

        .nav-text {
          min-width: 0;

          font-size: 11px;
          font-weight: 520;

          white-space: nowrap;

          transition:
            opacity 120ms ease,
            transform 180ms ease;
        }

        .nav-selected-dot {
          width: 4px;
          height: 4px;

          flex: 0 0 4px;

          margin-left: auto;

          border-radius: 50%;

          background: #6f8cff;
        }

        .sidebar-space {
          flex: 1;
        }

        .sidebar-bottom {
          display: flex;
          flex-direction: column;

          gap: 2px;
        }

        .sidebar-status {
          height: 31px;

          display: flex;
          align-items: center;

          gap: 6px;

          padding: 0 8px;

          overflow: hidden;
        }

        .status-dot {
          width: 5px;
          height: 5px;

          flex: 0 0 5px;

          border-radius: 50%;

          background: #3bb27d;
        }

        .status-text {
          color: #42424a;

          font-size: 8.5px;

          white-space: nowrap;
        }

        .collapsed {
          width: 54px;
        }

        .collapsed .brand-name,
        .collapsed .profile-data,
        .collapsed .profile-arrow,
        .collapsed .nav-title,
        .collapsed .nav-text,
        .collapsed .nav-selected-dot,
        .collapsed .status-text {
          opacity: 0;
          pointer-events: none;
        }

        .collapsed .sidebar-header {
          justify-content: center;
          padding: 0;
        }

        .collapsed .collapse-btn {
          display: none;
        }

        .collapsed .profile-card {
          justify-content: center;

          padding: 6px 0;

          border-color: transparent;

          background: transparent;
        }

        .collapsed .profile-avatar {
          width: 32px;
          height: 32px;

          flex-basis: 32px;
        }

        .collapsed .nav-row {
          justify-content: center;

          padding: 0;
        }

        .collapsed .sidebar-status {
          justify-content: center;

          padding: 0;
        }

        .app-content {
          min-height: 100vh;

          margin-left: 220px;

          transition:
            margin-left 280ms
            cubic-bezier(.23,1,.32,1);
        }

        .app-content.content-collapsed {
          margin-left: 54px;
        }

        .mobile-navigation {
          display: none;
        }

        @media (max-width: 760px) {
          .sidebar {
            display: none !important;
          }

          .app-content,
          .app-content.content-collapsed {
            margin-left: 0;
          }

          .app-content {
            padding-bottom: 78px;
          }

          .mobile-navigation {
            position: fixed;

            z-index: 100;

            left: 10px;
            right: 10px;
            bottom: 10px;

            height: 58px;

            display: grid;

            grid-template-columns:
              repeat(5, minmax(0, 1fr));

            gap: 2px;

            padding: 5px;

            border:
              1px solid
              rgba(255,255,255,.075);

            border-radius: 16px;

            background:
              rgba(17,17,20,.94);

            box-shadow:
              0 14px 40px
              rgba(0,0,0,.42);

            backdrop-filter: blur(18px);
            -webkit-backdrop-filter:
              blur(18px);
          }

          .mobile-item {
            position: relative;

            min-width: 0;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            gap: 3px;

            border-radius: 10px;

            color: #5e5e67;
          }

          .mobile-item.selected {
            background: #1a1a1e;
            color: #eeeeef;
          }

          .mobile-item.selected::before {
            content: "";

            position: absolute;
            top: 3px;

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

          .mobile-text {
            overflow: hidden;

            max-width: 100%;

            font-size: 8px;
            font-weight: 560;

            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          .sidebar,
          .app-content,
          .collapse-arrow {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
