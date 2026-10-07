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
              <span className="eyebrow">
                HOY
              </span>

              <h1>
                Hola, {profile.name}
              </h1>

              <p>
                Tu día, tu semana y lo que toca completar.
              </p>
            </div>

            <div className="header-actions">
              <button
                type="button"
                className="small-button"
              >
                + Registrar
              </button>
            </div>
          </header>

          <section className="top-grid">
            <article className="week-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">
                    SEMANA ACTUAL
                  </span>

                  <h2>
                    Cumplimiento
                  </h2>
                </div>

                <span className="subtle-chip">
                  Lun → Dom
                </span>
              </div>

              <div className="week-main">
                <div className="week-score">
                  <strong>
                    0%
                  </strong>

                  <span>
                    completado
                  </span>
                </div>

                <div className="week-progress">
                  <div className="progress-track">
                    <span
                      className="progress-value"
                      style={{
                        width: "0%",
                      }}
                    />
                  </div>

                  <div className="progress-labels">
                    <span>
                      0 / 4 objetivos
                    </span>

                    <span>
                      Queda toda la semana
                    </span>
                  </div>
                </div>
              </div>

              <div className="comparison-row">
                <span className="comparison-chip">
                  <span className="comparison-label">
                    Entreno
                  </span>

                  <strong>
                    0 / 4
                  </strong>
                </span>

                <span className="comparison-chip">
                  <span className="comparison-label">
                    Cardio
                  </span>

                  <strong>
                    0 / 150 min
                  </strong>
                </span>

                <span className="comparison-chip">
                  <span className="comparison-label">
                    Hábitos
                  </span>

                  <strong>
                    0%
                  </strong>
                </span>
              </div>
            </article>

            <article className="streak-card">
              <div className="card-heading">
                <div>
                  <span className="eyebrow">
                    RACHA
                  </span>

                  <h2>
                    Constancia
                  </h2>
                </div>

                <span className="flame">
                  🔥
                </span>
              </div>

              <div className="streak-number">
                <strong>
                  0
                </strong>

                <span>
                  días
                </span>
              </div>

              <div className="streak-meta">
                Mejor racha · 0 días
              </div>

              <div className="days-row">
                {["L", "M", "X", "J", "V", "S", "D"].map(
                  (day) => (
                    <div
                      className="day-cell"
                      key={day}
                    >
                      <span className="day-mark" />
                      <span>
                        {day}
                      </span>
                    </div>
                  )
                )}
              </div>
            </article>
          </section>

          <section className="metrics-grid">
            <article className="metric-card">
              <div className="metric-top">
                <span>
                  Entrenamiento
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
                    <path d="M7 8v8M17 8v8" />
                    <path d="M4 10v4M20 10v4" />
                    <path d="M7 12h10" />
                  </svg>
                </span>
              </div>

              <div className="metric-value">
                0
                <span>
                  / 4
                </span>
              </div>

              <div className="metric-footer">
                <span>
                  sesiones
                </span>

                <span>
                  esta semana
                </span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>
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

              <div className="metric-value">
                0
                <span>
                  / 150
                </span>
              </div>

              <div className="metric-footer">
                <span>
                  minutos
                </span>

                <span>
                  0 / 3 días
                </span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>
                  Peso
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

              <div className="metric-value">
                —
              </div>

              <div className="metric-footer">
                <span>
                  sin registro
                </span>

                <button type="button">
                  Añadir
                </button>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-top">
                <span>
                  Hábitos
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
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8.5 12 2.2 2.2 4.8-5" />
                  </svg>
                </span>
              </div>

              <div className="metric-value">
                0%
              </div>

              <div className="metric-footer">
                <span>
                  hoy
                </span>

                <span>
                  0 / 0
                </span>
              </div>
            </article>
          </section>

          <section className="content-grid">
            <article className="habits-card">
              <div className="section-header">
                <div>
                  <span className="eyebrow">
                    HÁBITOS
                  </span>

                  <h2>
                    Hoy
                  </h2>
                </div>

                <span className="subtle-chip">
                  0 / 0
                </span>
              </div>

              <div className="task-list">
                <div className="empty-row">
                  <span className="empty-status">
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
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />

                      <path d="m8.5 12 2.2 2.2 4.8-5" />
                    </svg>
                  </span>

                  <div className="empty-copy">
                    <strong>
                      No hay hábitos para hoy
                    </strong>

                    <span>
                      Configura tus hábitos para empezar a construir la racha.
                    </span>
                  </div>

                  <button
                    type="button"
                    className="row-action"
                  >
                    Configurar
                  </button>
                </div>
              </div>
            </article>

            <article className="week-summary-card">
              <div className="section-header">
                <div>
                  <span className="eyebrow">
                    RESUMEN
                  </span>

                  <h2>
                    Esta semana
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
                  <div>
                    <span className="summary-name">
                      Entreno
                    </span>

                    <span className="summary-sub">
                      objetivo semanal
                    </span>
                  </div>

                  <strong>
                    0 / 4
                  </strong>
                </div>

                <div className="summary-row">
                  <div>
                    <span className="summary-name">
                      Cardio
                    </span>

                    <span className="summary-sub">
                      minutos acumulados
                    </span>
                  </div>

                  <strong>
                    0
                  </strong>
                </div>

                <div className="summary-row">
                  <div>
                    <span className="summary-name">
                      Hábitos
                    </span>

                    <span className="summary-sub">
                      cumplimiento
                    </span>
                  </div>

                  <strong>
                    0%
                  </strong>
                </div>

                <div className="summary-row">
                  <div>
                    <span className="summary-name">
                      Racha
                    </span>

                    <span className="summary-sub">
                      días consecutivos
                    </span>
                  </div>

                  <strong>
                    0
                  </strong>
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
          max-width: 1480px;
          margin: 0 auto;
          padding: 30px 34px 60px;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .eyebrow {
          display: block;
          color: #5b5b64;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
        }

        .page-header h1 {
          margin: 6px 0 0;
          color: #f0f0f2;
          font-size: 29px;
          line-height: 1.08;
          font-weight: 620;
          letter-spacing: -.045em;
        }

        .page-header p {
          margin: 8px 0 0;
          color: #64646d;
          font-size: 11px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .small-button {
          height: 30px;
          padding: 0 11px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px;
          background: #17171b;
          color: #a3a3aa;
          font-size: 10px;
          font-weight: 560;
        }

        .small-button:hover {
          background: #1c1c20;
          color: #d8d8dc;
        }

        .top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(280px, .7fr);
          gap: 10px;
          margin-bottom: 10px;
        }

        .week-card,
        .streak-card,
        .metric-card,
        .habits-card,
        .week-summary-card {
          border: 1px solid rgba(255,255,255,.055);
          background: #111114;
          box-shadow:
            0 1px 0 rgba(255,255,255,.02) inset;
        }

        .week-card,
        .streak-card {
          min-height: 205px;
          padding: 16px;
          border-radius: 16px;
        }

        .week-card {
          display: flex;
          flex-direction: column;
        }

        .card-heading,
        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
        }

        .card-heading h2,
        .section-header h2 {
          margin: 5px 0 0;
          color: #d8d8dc;
          font-size: 13px;
          line-height: 1.2;
          font-weight: 590;
          letter-spacing: -.02em;
        }

        .subtle-chip {
          height: 22px;
          display: inline-flex;
          align-items: center;
          padding: 0 8px;
          border: 1px solid rgba(255,255,255,.05);
          border-radius: 7px;
          background: #17171a;
          color: #65656e;
          font-size: 9px;
          font-weight: 550;
        }

        .week-main {
          flex: 1;
          display: grid;
          grid-template-columns: 160px 1fr;
          align-items: center;
          gap: 22px;
          padding: 22px 0 18px;
        }

        .week-score strong {
          display: block;
          color: #f1f1f3;
          font-size: 39px;
          line-height: .95;
          font-weight: 620;
          letter-spacing: -.055em;
          font-variant-numeric: tabular-nums;
        }

        .week-score span {
          display: block;
          margin-top: 7px;
          color: #55555e;
          font-size: 9.5px;
        }

        .week-progress {
          min-width: 0;
        }

        .progress-track {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: #1a1a1f;
        }

        .progress-value {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #6f8cff;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 8px;
          color: #54545d;
          font-size: 8.5px;
        }

        .comparison-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .comparison-chip {
          min-height: 29px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0 9px;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 8px;
          background: #151518;
        }

        .comparison-label {
          color: #55555e;
          font-size: 8.5px;
        }

        .comparison-chip strong {
          color: #a8a8af;
          font-size: 9px;
          font-weight: 590;
          font-variant-numeric: tabular-nums;
        }

        .streak-card {
          display: flex;
          flex-direction: column;
        }

        .flame {
          font-size: 15px;
        }

        .streak-number {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: 27px;
        }

        .streak-number strong {
          color: #efeff1;
          font-size: 37px;
          line-height: .95;
          font-weight: 620;
          letter-spacing: -.05em;
          font-variant-numeric: tabular-nums;
        }

        .streak-number span {
          color: #5f5f68;
          font-size: 10px;
        }

        .streak-meta {
          margin-top: 7px;
          color: #4f4f57;
          font-size: 8.5px;
        }

        .days-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
          margin-top: auto;
        }

        .day-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          color: #4e4e56;
          font-size: 7.5px;
          font-weight: 650;
        }

        .day-mark {
          width: 100%;
          height: 25px;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 7px;
          background: #161619;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 10px;
        }

        .metric-card {
          min-height: 125px;
          display: flex;
          flex-direction: column;
          padding: 14px;
          border-radius: 14px;
        }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #72727b;
          font-size: 9.5px;
          font-weight: 550;
        }

        .metric-icon {
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 8px;
          background: #17171a;
          color: #5e5e67;
        }

        .metric-value {
          margin-top: 17px;
          color: #e9e9eb;
          font-size: 22px;
          line-height: 1;
          font-weight: 610;
          letter-spacing: -.035em;
          font-variant-numeric: tabular-nums;
        }

        .metric-value span {
          color: #505059;
          font-size: 11px;
          font-weight: 520;
        }

        .metric-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: auto;
          color: #4f4f57;
          font-size: 8.5px;
        }

        .metric-footer button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #6f82c6;
          font-size: 8.5px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(300px, .75fr);
          gap: 10px;
        }

        .habits-card,
        .week-summary-card {
          min-height: 230px;
          padding: 15px;
          border-radius: 15px;
        }

        .task-list {
          margin-top: 15px;
        }

        .empty-row {
          min-height: 66px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 10px;
          background: #151518;
        }

        .empty-status {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #1a1a1e;
          color: #5e5e67;
        }

        .empty-copy {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .empty-copy strong {
          color: #bfbfc5;
          font-size: 9.5px;
          font-weight: 570;
        }

        .empty-copy span {
          color: #515159;
          font-size: 8.5px;
          line-height: 1.4;
        }

        .row-action {
          height: 27px;
          padding: 0 9px;
          border: 1px solid rgba(255,255,255,.055);
          border-radius: 7px;
          background: #19191d;
          color: #7e7e87;
          font-size: 8.5px;
          font-weight: 550;
        }

        .row-action:hover {
          color: #bcbcc2;
          background: #1d1d21;
        }

        .icon-button {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 7px;
          background: #17171a;
          color: #575760;
        }

        .summary-list {
          margin-top: 11px;
          display: flex;
          flex-direction: column;
        }

        .summary-row {
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,.04);
        }

        .summary-row:last-child {
          border-bottom: 0;
        }

        .summary-row > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .summary-name {
          color: #8e8e96;
          font-size: 9px;
          font-weight: 550;
        }

        .summary-sub {
          color: #4b4b53;
          font-size: 7.5px;
        }

        .summary-row strong {
          color: #b4b4ba;
          font-size: 9px;
          font-weight: 580;
          font-variant-numeric: tabular-nums;
        }

        @media (min-width: 1600px) {
          .dashboard-inner {
            max-width: 1580px;
            padding: 36px 42px 70px;
          }

          .page-header {
            margin-bottom: 30px;
          }

          .page-header h1 {
            font-size: 32px;
          }

          .top-grid,
          .metrics-grid,
          .content-grid {
            gap: 12px;
          }

          .week-card,
          .streak-card {
            min-height: 220px;
            padding: 18px;
          }

          .metrics-grid {
            grid-template-columns: repeat(4, minmax(220px, 1fr));
          }

          .metric-card {
            min-height: 136px;
            padding: 16px;
          }

          .content-grid {
            grid-template-columns: minmax(0, 1.6fr) minmax(340px, .7fr);
          }
        }

        @media (min-width: 1920px) {
          .dashboard-inner {
            max-width: 1700px;
            padding: 42px 50px 80px;
          }

          .top-grid {
            grid-template-columns: minmax(0, 1.85fr) minmax(330px, .65fr);
          }

          .week-card,
          .streak-card {
            min-height: 236px;
          }

          .week-main {
            grid-template-columns: 190px 1fr;
          }

          .week-score strong {
            font-size: 44px;
          }

          .streak-number strong {
            font-size: 42px;
          }

          .metric-card {
            min-height: 145px;
          }

          .metric-value {
            font-size: 24px;
          }

          .habits-card,
          .week-summary-card {
            min-height: 255px;
          }
        }

        @media (min-width: 2560px) {
          .dashboard-inner {
            max-width: 1880px;
            padding: 50px 64px 90px;
          }

          .page-header h1 {
            font-size: 35px;
          }

          .top-grid,
          .metrics-grid,
          .content-grid {
            gap: 14px;
          }

          .week-card,
          .streak-card {
            min-height: 255px;
            padding: 20px;
          }

          .metric-card {
            min-height: 155px;
            padding: 18px;
          }

          .content-grid {
            grid-template-columns: minmax(0, 1.7fr) minmax(380px, .7fr);
          }

          .habits-card,
          .week-summary-card {
            min-height: 280px;
            padding: 18px;
          }
        }

        @media (max-width: 1150px) {
          .dashboard-inner {
            padding: 26px 24px 50px;
          }

          .top-grid {
            grid-template-columns: 1fr;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .dashboard-inner {
            padding: 20px 13px 26px;
          }

          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 24px;
          }

          .page-header p {
            max-width: 230px;
          }

          .small-button {
            height: 29px;
            padding: 0 9px;
          }

          .week-card,
          .streak-card {
            min-height: 190px;
            padding: 14px;
          }

          .week-main {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 18px 0;
          }

          .week-score strong {
            font-size: 35px;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .metric-card {
            min-height: 120px;
            padding: 12px;
          }

          .metric-value {
            font-size: 19px;
          }

          .empty-row {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .row-action {
            margin-left: 40px;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .comparison-row {
            flex-direction: column;
          }

          .comparison-chip {
            justify-content: space-between;
          }

          .page-header {
            align-items: flex-start;
          }

          .small-button {
            font-size: 0;
            width: 30px;
            padding: 0;
          }

          .small-button::after {
            content: "+";
            font-size: 15px;
          }
        }
      `}</style>
    </AppShell>
  );
}
