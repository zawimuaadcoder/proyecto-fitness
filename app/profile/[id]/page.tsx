import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppShell from "@/components/AppShell";

type ProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    <AppShell
      profileId={profile.id}
      profileName={profile.name}
      profileColor={profile.color}
      avatarUrl={profile.avatar_url}
    >
      <section className="dashboard">
        <div className="dashboard-inner">
          <header className="page-header">
            <div>
              <span className="eyebrow">HOY</span>

              <h1>
                Hola, {profile.name}
              </h1>

              <p>
                Tu resumen diario y progreso de esta semana.
              </p>
            </div>

            <div className="date-pill">
              Hoy
            </div>
          </header>

          <section className="hero-grid">
            <article className="insight-card main-card">
              <div className="card-top">
                <div>
                  <span className="card-label">
                    CUMPLIMIENTO SEMANAL
                  </span>

                  <strong className="big-number">
                    0%
                  </strong>
                </div>

                <span className="status-chip">
                  Semana actual
                </span>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: "0%",
                  }}
                />
              </div>

              <div className="card-footer">
                <span>
                  0 de 4 objetivos completados
                </span>

                <span className="muted">
                  Empieza registrando tu día
                </span>
              </div>
            </article>

            <article className="insight-card streak-card">
              <div className="card-top">
                <span className="card-label">
                  RACHA ACTUAL
                </span>

                <span className="flame">
                  🔥
                </span>
              </div>

              <div className="streak-value">
                <strong>0</strong>
                <span>días</span>
              </div>

              <div className="week-dots">
                {["L", "M", "X", "J", "V", "S", "D"].map(
                  (day) => (
                    <span
                      key={day}
                      className="day-dot"
                    >
                      {day}
                    </span>
                  )
                )}
              </div>
            </article>
          </section>

          <section className="metrics-grid">
            <article className="metric-card">
              <div className="metric-header">
                <span className="metric-label">
                  Entreno
                </span>

                <span className="metric-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 7v10" />
                    <path d="M18 7v10" />
                    <path d="M3 9v6" />
                    <path d="M21 9v6" />
                    <path d="M6 12h12" />
                  </svg>
                </span>
              </div>

              <strong className="metric-number">
                0 / 4
              </strong>

              <span className="metric-caption">
                sesiones esta semana
              </span>

              <div className="mini-progress">
                <span style={{ width: "0%" }} />
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-header">
                <span className="metric-label">
                  Cardio
                </span>

                <span className="metric-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12h4l2-5 4 10 2-5h6" />
                  </svg>
                </span>
              </div>

              <strong className="metric-number">
                0 / 150
              </strong>

              <span className="metric-caption">
                minutos esta semana
              </span>

              <div className="mini-progress">
                <span style={{ width: "0%" }} />
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-header">
                <span className="metric-label">
                  Peso actual
                </span>

                <span className="metric-icon">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19V5" />
                    <path d="M4 19h16" />
                    <path d="m7 14 4-4 3 2 4-5" />
                  </svg>
                </span>
              </div>

              <strong className="metric-number">
                —
              </strong>

              <span className="metric-caption">
                sin registros todavía
              </span>

              <button
                type="button"
                className="text-action"
              >
                Añadir peso
              </button>
            </article>
          </section>

          <section className="lower-grid">
            <article className="task-card">
              <div className="section-header">
                <div>
                  <span className="section-label">
                    HÁBITOS
                  </span>

                  <h2>
                    Hoy
                  </h2>
                </div>

                <span className="counter-chip">
                  0 / 0
                </span>
              </div>

              <div className="empty-tasks">
                <span className="empty-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <path d="m8.5 12 2.2 2.2 4.8-5" />
                  </svg>
                </span>

                <div>
                  <strong>
                    Sin hábitos configurados
                  </strong>

                  <p>
                    Crea tus hábitos para empezar a construir tu racha.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="secondary-action"
              >
                Configurar hábitos
              </button>
            </article>

            <article className="week-card">
              <div className="section-header">
                <div>
                  <span className="section-label">
                    ESTA SEMANA
                  </span>

                  <h2>
                    Resumen
                  </h2>
                </div>

                <button
                  type="button"
                  className="icon-button"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>

              <div className="summary-list">
                <div className="summary-row">
                  <span>Entrenos</span>

                  <strong>0 / 4</strong>
                </div>

                <div className="summary-row">
                  <span>Cardio</span>

                  <strong>0 min</strong>
                </div>

                <div className="summary-row">
                  <span>Hábitos</span>

                  <strong>0%</strong>
                </div>

                <div className="summary-row">
                  <span>Racha</span>

                  <strong>0 días</strong>
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>

      <style>{`
        .dashboard {
          min-height: 100vh;
          background: #0c0c0e;
        }

        .dashboard-inner {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 32px 50px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 26px;
        }

        .eyebrow,
        .card-label,
        .section-label {
          display: block;
          color: #5f5f68;
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: .13em;
        }

        .page-header h1 {
          margin: 6px 0 0;
          color: #f1f1f3;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 620;
          letter-spacing: -.04em;
        }

        .page-header p {
          margin: 8px 0 0;
          color: #696972;
          font-size: 11.5px;
        }

        .date-pill {
          height: 27px;
          display: inline-flex;
          align-items: center;
          padding: 0 10px;
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 8px;
          background: #141417;
          color: #777780;
          font-size: 10.5px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(220px, .75fr);
          gap: 10px;
          margin-bottom: 10px;
        }

        .insight-card,
        .metric-card,
        .task-card,
        .week-card {
          border: 1px solid rgba(255,255,255,.06);
          background: #111114;
          box-shadow:
            0 1px 0 rgba(255,255,255,.02) inset;
        }

        .insight-card {
          min-height: 170px;
          padding: 16px;
          border-radius: 16px;
        }

        .main-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .big-number {
          display: block;
          margin-top: 11px;
          color: #f2f2f3;
          font-size: 34px;
          line-height: 1;
          font-weight: 620;
          letter-spacing: -.05em;
          font-variant-numeric: tabular-nums;
        }

        .status-chip,
        .counter-chip {
          height: 22px;
          display: inline-flex;
          align-items: center;
          padding: 0 8px;
          border: 1px solid rgba(255,255,255,.055);
          border-radius: 7px;
          background: #18181c;
          color: #74747d;
          font-size: 9.5px;
          font-weight: 550;
        }

        .progress-track {
          width: 100%;
          height: 6px;
          overflow: hidden;
          border-radius: 999px;
          background: #1b1b20;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #6f8cff;
          transition: width 400ms cubic-bezier(.16,1,.3,1);
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          color: #888891;
          font-size: 10.5px;
        }

        .card-footer .muted {
          color: #55555e;
        }

        .streak-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .flame {
          font-size: 16px;
          filter: saturate(.8);
        }

        .streak-value {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .streak-value strong {
          font-size: 31px;
          font-weight: 620;
          letter-spacing: -.045em;
          font-variant-numeric: tabular-nums;
        }

        .streak-value span {
          color: #6e6e77;
          font-size: 11px;
        }

        .week-dots {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }

        .day-dot {
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.05);
          border-radius: 7px;
          background: #17171a;
          color: #55555d;
          font-size: 8.5px;
          font-weight: 650;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }

        .metric-card {
          min-height: 126px;
          display: flex;
          flex-direction: column;
          padding: 14px;
          border-radius: 14px;
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .metric-label {
          color: #787881;
          font-size: 10.5px;
          font-weight: 550;
        }

        .metric-icon {
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.055);
          border-radius: 8px;
          background: #17171a;
          color: #666670;
        }

        .metric-number {
          color: #e9e9eb;
          font-size: 20px;
          line-height: 1;
          font-weight: 610;
          letter-spacing: -.03em;
          font-variant-numeric: tabular-nums;
        }

        .metric-caption {
          margin-top: 5px;
          color: #55555e;
          font-size: 9.5px;
        }

        .mini-progress {
          height: 4px;
          margin-top: auto;
          overflow: hidden;
          border-radius: 999px;
          background: #1b1b20;
        }

        .mini-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #6f8cff;
        }

        .text-action {
          align-self: flex-start;
          margin-top: auto;
          padding: 0;
          border: 0;
          background: transparent;
          color: #7188df;
          font-size: 9.5px;
        }

        .lower-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(260px, .8fr);
          gap: 10px;
        }

        .task-card,
        .week-card {
          min-height: 205px;
          padding: 15px;
          border-radius: 15px;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .section-header h2 {
          margin: 5px 0 0;
          color: #dddddf;
          font-size: 14px;
          font-weight: 590;
          letter-spacing: -.02em;
        }

        .empty-tasks {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 78px;
          padding: 12px;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 11px;
          background: #141417;
        }

        .empty-icon {
          width: 34px;
          height: 34px;
          flex: 0 0 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #1a1a1e;
          color: #666670;
        }

        .empty-tasks strong {
          display: block;
          color: #c7c7cc;
          font-size: 10.5px;
          font-weight: 570;
        }

        .empty-tasks p {
          margin: 4px 0 0;
          color: #595962;
          font-size: 9.5px;
          line-height: 1.45;
        }

        .secondary-action {
          height: 29px;
          margin-top: 11px;
          padding: 0 10px;
          border: 1px solid rgba(255,255,255,.065);
          border-radius: 8px;
          background: #18181c;
          color: #888891;
          font-size: 9.5px;
          font-weight: 550;
        }

        .secondary-action:hover {
          background: #1c1c21;
          color: #c8c8cd;
        }

        .icon-button {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid rgba(255,255,255,.055);
          border-radius: 7px;
          background: #17171a;
          color: #62626b;
        }

        .summary-list {
          display: flex;
          flex-direction: column;
        }

        .summary-row {
          min-height: 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,.045);
          color: #65656e;
          font-size: 10px;
        }

        .summary-row:last-child {
          border-bottom: 0;
        }

        .summary-row strong {
          color: #b7b7bd;
          font-size: 10px;
          font-weight: 570;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 900px) {
          .dashboard-inner {
            padding: 24px 22px 45px;
          }

          .hero-grid,
          .lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .dashboard-inner {
            padding: 20px 14px 30px;
          }

          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .card-footer {
            flex-direction: column;
            gap: 4px;
          }

          .insight-card {
            min-height: 155px;
          }

          .metric-card {
            min-height: 115px;
          }
        }
      `}</style>
    </AppShell>
  );
}
