import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProfilePage({
  params,
}: ProfilePageProps) {
  const { id } = await params;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, color, avatar_url")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  return (
    <main className="page">
      <section className="shell">
        <header className="topbar">
          <Link href="/" className="back">
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
              <path d="M15 18l-6-6 6-6" />
            </svg>

            Perfiles
          </Link>

          <div className="profile">
            <span
              className="avatar"
              style={{
                background: profile.color || "#6f8cff",
              }}
            >
              {profile.name
                .trim()
                .slice(0, 1)
                .toUpperCase()}
            </span>

            <span>{profile.name}</span>
          </div>
        </header>

        <div className="welcome">
          <span className="eyebrow">HOY</span>

          <h1>
            Hola, {profile.name}
          </h1>

          <p>
            Este será tu dashboard de entrenamiento,
            hábitos y progreso.
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <span className="cardLabel">
              Racha actual
            </span>

            <strong className="metric">
              🔥 0 días
            </strong>

            <span className="cardMeta">
              Empieza completando tus hábitos de hoy.
            </span>
          </div>

          <div className="card">
            <span className="cardLabel">
              Entrenamientos
            </span>

            <strong className="metric">
              0 / 4
            </strong>

            <span className="cardMeta">
              Esta semana
            </span>
          </div>

          <div className="card">
            <span className="cardLabel">
              Cardio
            </span>

            <strong className="metric">
              0 / 150 min
            </strong>

            <span className="cardMeta">
              Objetivo semanal
            </span>
          </div>

          <div className="card">
            <span className="cardLabel">
              Cumplimiento
            </span>

            <strong className="metric">
              0%
            </strong>

            <span className="cardMeta">
              Semana actual
            </span>
          </div>
        </div>
      </section>

      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 18px 14px;
          background: #0c0c0e;
          color: #f4f4f5;
        }

        .shell {
          width: 100%;
          max-width: 760px;
        }

        .topbar {
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 48px;
        }

        .back {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #777780;
          font-size: 12px;
          transition: color 120ms ease;
        }

        .back:hover {
          color: #d6d6da;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cfcfd4;
          font-size: 12px;
          font-weight: 550;
        }

        .avatar {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          color: white;
          font-size: 11px;
          font-weight: 650;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.09) inset;
        }

        .welcome {
          margin-bottom: 26px;
        }

        .eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #686872;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .13em;
        }

        h1 {
          margin: 0;
          color: #f2f2f3;
          font-size: 28px;
          font-weight: 620;
          letter-spacing: -.04em;
        }

        .welcome p {
          margin: 8px 0 0;
          color: #777780;
          font-size: 12px;
        }

        .grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .card {
          min-height: 135px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 15px;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px;
          background: #111114;
          box-shadow:
            0 1px 0 rgba(255,255,255,.02) inset;
        }

        .cardLabel {
          color: #777780;
          font-size: 10.5px;
          font-weight: 550;
        }

        .metric {
          color: #f0f0f2;
          font-size: 20px;
          font-weight: 620;
          letter-spacing: -.03em;
          font-variant-numeric: tabular-nums;
        }

        .cardMeta {
          color: #5f5f68;
          font-size: 10.5px;
        }

        @media (max-width: 520px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .topbar {
            margin-bottom: 38px;
          }
        }
      `}</style>
    </main>
  );
}
