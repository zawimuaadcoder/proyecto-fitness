import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, color, avatar_url, pin_hash")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main className="profile-page">
        <div className="error-card">
          <span className="error-dot" />

          <div>
            <p className="error-title">
              No se pudieron cargar los perfiles
            </p>

            <p className="error-copy">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-shell">
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">F</span>
            <span className="brand-copy">Fitness</span>
          </div>

          <span className="sync-pill">
            <span className="sync-dot" />
            Sincronizado
          </span>
        </header>

        <div className="selector-card">
          <div className="selector-header">
            <div>
              <p className="section-kicker">
                PERFILES
              </p>

              <h1>¿Quién entrena hoy?</h1>

              <p className="subtitle">
                Selecciona un perfil para continuar.
              </p>
            </div>

            <span className="profile-count">
              {profiles?.length ?? 0}
            </span>
          </div>

          <div className="profile-list">
            {profiles?.map((profile, index) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.id}`}
                className="profile-row"
                style={{
                  animationDelay: `${index * 55}ms`,
                }}
              >
                <span
                  className="avatar"
                  style={{
                    background: profile.color || "#6f8cff",
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.name}
                    />
                  ) : (
                    profile.name
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()
                  )}
                </span>

                <span className="profile-content">
                  <span className="profile-name">
                    {profile.name}
                  </span>

                  <span className="profile-meta">
                    {profile.pin_hash
                      ? "PIN protegido"
                      : "Acceso directo"}
                  </span>
                </span>

                {profile.pin_hash && (
                  <span className="status-pill">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                      />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>

                    PIN
                  </span>
                )}

                <span className="row-chevron">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </span>
              </Link>
            ))}

            <Link
              href="/create-profile"
              className="profile-row add-row"
            >
              <span className="add-avatar">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>

              <span className="profile-content">
                <span className="profile-name">
                  Crear perfil
                </span>

                <span className="profile-meta">
                  Añadir una nueva persona
                </span>
              </span>

              <span className="row-chevron">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>

          <div className="selector-footer">
            <span>
              Los datos de cada perfil se guardan por separado.
            </span>

            <button type="button">
              Gestionar perfiles
            </button>
          </div>
        </div>

        <footer className="page-footer">
          <span>Proyecto Fitness</span>
          <span className="footer-dot" />
          <span>v0.1</span>
        </footer>
      </section>

      <style>{`
        .profile-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 22px 16px;
          background: #0c0c0e;
          color: #f4f4f5;
        }

        .profile-shell {
          width: 100%;
          max-width: 430px;
          display: flex;
          flex-direction: column;
        }

        .topbar {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 54px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-mark {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background: #f4f4f5;
          color: #111113;
          font-size: 11px;
          font-weight: 750;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.08),
            0 1px 2px rgba(0,0,0,.4);
        }

        .brand-copy {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: -0.015em;
          color: #d7d7dc;
        }

        .sync-pill {
          display: inline-flex;
          height: 24px;
          align-items: center;
          gap: 6px;
          padding: 0 8px;
          border-radius: 999px;
          background: #131316;
          border: 1px solid rgba(255,255,255,.06);
          color: #777780;
          font-size: 10.5px;
          font-weight: 500;
        }

        .sync-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #3dbb87;
          box-shadow: 0 0 7px rgba(61,187,135,.35);
        }

        .selector-card {
          overflow: hidden;
          border-radius: 18px;
          background: #111114;
          border: 1px solid rgba(255,255,255,.065);
          box-shadow:
            0 1px 0 rgba(255,255,255,.025) inset,
            0 18px 50px rgba(0,0,0,.22);
          animation:
            card-enter 420ms
            cubic-bezier(.16,1,.3,1)
            both;
        }

        .selector-header {
          min-height: 128px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding: 22px 22px 18px;
          border-bottom:
            1px solid rgba(255,255,255,.055);
        }

        .section-kicker {
          margin: 0 0 8px;
          color: #686872;
          font-size: 9px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: .13em;
        }

        .selector-header h1 {
          margin: 0;
          color: #f2f2f3;
          font-size: 22px;
          line-height: 1.15;
          font-weight: 620;
          letter-spacing: -.035em;
        }

        .subtitle {
          margin: 7px 0 0;
          color: #777780;
          font-size: 12px;
          line-height: 1.5;
        }

        .profile-count {
          min-width: 26px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 7px;
          border-radius: 7px;
          background: #18181c;
          border: 1px solid rgba(255,255,255,.06);
          color: #96969f;
          font-size: 11px;
          font-weight: 550;
          font-variant-numeric: tabular-nums;
        }

        .profile-list {
          padding: 6px;
        }

        .profile-row {
          position: relative;
          width: 100%;
          height: 58px;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 6px 9px;
          border: 0;
          border-radius: 11px;
          background: transparent;
          color: inherit;
          text-align: left;
          text-decoration: none;
          outline: none;
          animation:
            row-enter 380ms
            cubic-bezier(.16,1,.3,1)
            both;
          transition:
            background-color 130ms ease,
            transform 130ms ease;
        }

        .profile-row:hover {
          background: #19191d;
        }

        .profile-row:active {
          transform: scale(.985);
        }

        .avatar,
        .add-avatar {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 11px;
        }

        .avatar {
          color: #fff;
          font-size: 14px;
          font-weight: 650;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.09) inset,
            0 2px 8px rgba(0,0,0,.18);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .add-avatar {
          background: #18181c;
          border: 1px solid rgba(255,255,255,.07);
          color: #797982;
        }

        .profile-content {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .profile-name {
          overflow: hidden;
          color: #e8e8eb;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 560;
          letter-spacing: -.01em;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .profile-meta {
          color: #696973;
          font-size: 10.5px;
          line-height: 1.2;
        }

        .status-pill {
          height: 21px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0 7px;
          border-radius: 7px;
          background: #18181c;
          border: 1px solid rgba(255,255,255,.055);
          color: #83838c;
          font-size: 9.5px;
          font-weight: 600;
        }

        .row-chevron {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #515159;
          transition:
            transform 150ms cubic-bezier(.16,1,.3,1),
            color 150ms ease;
        }

        .profile-row:hover .row-chevron {
          transform: translateX(2px);
          color: #a0a0a8;
        }

        .add-row {
          margin-top: 3px;
          border-top:
            1px solid rgba(255,255,255,.045);
          border-radius: 0 0 11px 11px;
        }

        .add-row .profile-name {
          color: #c2c2c8;
        }

        .selector-footer {
          min-height: 45px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 16px;
          border-top:
            1px solid rgba(255,255,255,.055);
          background: #0f0f12;
        }

        .selector-footer > span {
          color: #606069;
          font-size: 10.5px;
        }

        .selector-footer button {
          height: 27px;
          flex: 0 0 auto;
          padding: 0 9px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px;
          background: #17171a;
          color: #9c9ca4;
          font-size: 10.5px;
          font-weight: 550;
          transition:
            background-color 120ms ease,
            color 120ms ease,
            transform 120ms ease;
        }

        .selector-footer button:hover {
          background: #1d1d21;
          color: #d5d5d9;
        }

        .selector-footer button:active {
          transform: scale(.97);
        }

        .page-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 20px;
          color: #45454c;
          font-size: 9.5px;
        }

        .footer-dot {
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: #44444b;
        }

        .error-card {
          width: 100%;
          max-width: 390px;
          display: flex;
          gap: 10px;
          margin: auto;
          padding: 14px;
          border-radius: 14px;
          background: #141114;
          border: 1px solid rgba(220,90,100,.14);
        }

        .error-dot {
          width: 7px;
          height: 7px;
          flex: 0 0 7px;
          margin-top: 5px;
          border-radius: 50%;
          background: #df626c;
        }

        .error-title {
          margin: 0;
          color: #e5e5e7;
          font-size: 12.5px;
          font-weight: 600;
        }

        .error-copy {
          margin: 4px 0 0;
          color: #76767e;
          font-size: 11px;
          line-height: 1.45;
        }

        @keyframes card-enter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes row-enter {
          from {
            opacity: 0;
            transform: translateY(5px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 520px) {
          .profile-page {
            padding: 15px 12px;
          }

          .topbar {
            margin-bottom: 38px;
          }

          .selector-card {
            border-radius: 16px;
          }

          .selector-header {
            padding: 19px 17px 16px;
          }

          .selector-header h1 {
            font-size: 20px;
          }

          .selector-footer {
            padding: 0 12px;
          }

          .selector-footer > span {
            max-width: 185px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .selector-card,
          .profile-row {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
