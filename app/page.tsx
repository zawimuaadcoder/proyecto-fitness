import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, name, color, avatar_url")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <main className="page">
        <div className="errorCard">
          <span className="errorTitle">No se pudieron cargar los perfiles</span>
          <span className="errorText">{error.message}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="profileScreen">
        <div className="brand">
          <div className="logo">
            <span>F</span>
          </div>

          <span className="brandName">Fitness</span>
        </div>

        <div className="heading">
          <span className="eyebrow">PROYECTO FITNESS</span>

          <h1>¿Quién entra hoy?</h1>

          <p>
            Elige tu perfil para acceder a tus entrenamientos,
            hábitos y progreso.
          </p>
        </div>

        <div className="profilesGrid">
          {profiles?.map((profile) => (
            <button
              key={profile.id}
              type="button"
              className="profileCard"
            >
              <div
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
                  <span>
                    {profile.name
                      .trim()
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="profileInfo">
                <span className="profileName">
                  {profile.name}
                </span>

                <span className="profileHint">
                  Entrar
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </div>
            </button>
          ))}

          <button
            type="button"
            className="profileCard createCard"
          >
            <div className="addAvatar">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>

            <div className="profileInfo">
              <span className="profileName">
                Crear perfil
              </span>

              <span className="profileHint">
                Añadir nuevo
              </span>
            </div>
          </button>
        </div>

        <div className="footer">
          <span>{profiles?.length ?? 0} perfiles</span>
          <span className="dot" />
          <span>Datos sincronizados</span>
        </div>
      </section>

      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          background:
            radial-gradient(
              circle at 50% -10%,
              rgba(111, 140, 255, 0.10),
              transparent 32%
            ),
            #0b0b0c;
          color: #f5f5f5;
          padding: 28px 20px;
        }

        .profileScreen {
          width: 100%;
          max-width: 720px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .brand {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 80px;
        }

        .logo {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #f5f5f5;
          color: #0b0b0c;
          font-size: 13px;
          font-weight: 800;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 8px 30px rgba(0,0,0,0.25);
        }

        .brandName {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #dddddf;
        }

        .heading {
          text-align: center;
          max-width: 480px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 10px;
          color: #6f8cff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .heading h1 {
          margin: 0;
          font-size: clamp(32px, 7vw, 48px);
          line-height: 1;
          font-weight: 650;
          letter-spacing: -0.045em;
        }

        .heading p {
          max-width: 420px;
          margin: 15px auto 0;
          color: #898991;
          font-size: 14px;
          line-height: 1.6;
        }

        .profilesGrid {
          width: 100%;
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 42px;
        }

        .profileCard {
          appearance: none;
          border: 1px solid rgba(255,255,255,0.07);
          outline: none;
          min-height: 190px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          text-align: left;
          padding: 12px;
          border-radius: 20px;
          background: #121214;
          color: inherit;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.03) inset,
            0 16px 50px rgba(0,0,0,0.14);
          transition:
            transform 180ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 180ms ease,
            background-color 180ms ease;
        }

        .profileCard:hover {
          transform: translateY(-3px);
          border-color: rgba(255,255,255,0.14);
          background: #161619;
        }

        .profileCard:active {
          transform: scale(0.985);
        }

        .avatar,
        .addAvatar {
          width: 100%;
          aspect-ratio: 1 / 0.78;
          min-height: 105px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 14px;
        }

        .avatar {
          color: white;
          font-size: 36px;
          font-weight: 650;
          letter-spacing: -0.04em;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .addAvatar {
          color: #777780;
          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,0.035),
              rgba(255,255,255,0.015)
            );
          border: 1px dashed rgba(255,255,255,0.12);
        }

        .profileInfo {
          padding: 11px 4px 2px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .profileName {
          color: #f0f0f1;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .profileHint {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #72727b;
          font-size: 11px;
        }

        .createCard .profileName {
          color: #c8c8cd;
        }

        .footer {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 30px;
          color: #55555d;
          font-size: 11px;
        }

        .dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: #44444a;
        }

        .errorCard {
          margin: auto;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 18px;
          border: 1px solid rgba(227, 93, 106, 0.20);
          border-radius: 16px;
          background: rgba(227, 93, 106, 0.07);
        }

        .errorTitle {
          font-size: 14px;
          font-weight: 600;
        }

        .errorText {
          font-size: 12px;
          color: #99999f;
        }

        @media (max-width: 520px) {
          .page {
            padding: 20px 16px;
          }

          .brand {
            margin-bottom: 60px;
          }

          .profilesGrid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-top: 34px;
          }

          .profileCard {
            min-height: 175px;
            border-radius: 18px;
            padding: 10px;
          }

          .avatar,
          .addAvatar {
            min-height: 105px;
            border-radius: 13px;
          }

          .heading p {
            font-size: 13px;
          }
        }
      `}</style>
    </main>
  );
}
