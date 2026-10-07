"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const COLORS = [
  "#6F8CFF",
  "#7C6FFF",
  "#B56FFF",
  "#E26F9A",
  "#E9865B",
  "#E5B95C",
  "#48B88A",
  "#4AA8C7",
];

export default function CreateProfilePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pin, setPin] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Escribe un nombre para el perfil.");
      return;
    }

    if (pinEnabled && pin.length !== 4) {
      setError("El PIN debe tener 4 números.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("profiles")
      .insert({
        name: name.trim(),
        color,
        pin_hash: pinEnabled ? pin : null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="page">
      <section className="shell">
        <button
          type="button"
          className="backButton"
          onClick={() => router.push("/")}
        >
          <svg
            width="15"
            height="15"
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
        </button>

        <div className="card">
          <div className="header">
            <div>
              <span className="eyebrow">NUEVO PERFIL</span>

              <h1>Crear perfil</h1>

              <p>
                Configura lo básico. Después podrás añadir objetivos,
                hábitos y preferencias.
              </p>
            </div>

            <div
              className="previewAvatar"
              style={{ background: color }}
            >
              {name.trim()
                ? name.trim().slice(0, 1).toUpperCase()
                : "?"}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section">
              <label className="label" htmlFor="name">
                Nombre
              </label>

              <input
                id="name"
                className="input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Alex"
                maxLength={30}
                autoFocus
              />
            </div>

            <div className="section">
              <span className="label">Color del perfil</span>

              <div className="colorGrid">
                {COLORS.map((item) => {
                  const active = color === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      className={`colorButton ${
                        active ? "active" : ""
                      }`}
                      aria-label={`Seleccionar color ${item}`}
                      aria-pressed={active}
                      onClick={() => setColor(item)}
                    >
                      <span
                        className="colorSwatch"
                        style={{ background: item }}
                      />

                      {active && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="section pinSection">
              <div className="pinHeader">
                <div>
                  <span className="label">PIN de privacidad</span>

                  <span className="hint">
                    Opcional. Se pedirá al abrir este perfil.
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={pinEnabled}
                  className={`switch ${
                    pinEnabled ? "switchOn" : ""
                  }`}
                  onClick={() => {
                    setPinEnabled((current) => !current);
                    setPin("");
                  }}
                >
                  <span />
                </button>
              </div>

              <div
                className="pinReveal"
                style={{
                  gridTemplateRows: pinEnabled ? "1fr" : "0fr",
                  opacity: pinEnabled ? 1 : 0,
                }}
              >
                <div className="pinRevealInner">
                  <input
                    className="input pinInput"
                    value={pin}
                    onChange={(event) =>
                      setPin(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4)
                      )
                    }
                    inputMode="numeric"
                    type="password"
                    placeholder="••••"
                    maxLength={4}
                    disabled={!pinEnabled}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="error">
                <span className="errorDot" />
                {error}
              </div>
            )}

            <div className="footer">
              <button
                type="button"
                className="secondaryButton"
                onClick={() => router.push("/")}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="primaryButton"
                disabled={saving}
              >
                {saving ? "Guardando…" : "Crear perfil"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          padding: 22px 16px;
          background: #0c0c0e;
          color: #f4f4f5;
        }

        .shell {
          width: 100%;
          max-width: 430px;
        }

        .backButton {
          height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 18px;
          padding: 0 8px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #777780;
          font-size: 12px;
          transition:
            background-color 120ms ease,
            color 120ms ease,
            transform 120ms ease;
        }

        .backButton:hover {
          background: #17171a;
          color: #d4d4d8;
        }

        .backButton:active {
          transform: scale(.97);
        }

        .card {
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.065);
          border-radius: 18px;
          background: #111114;
          box-shadow:
            0 1px 0 rgba(255,255,255,.025) inset,
            0 18px 50px rgba(0,0,0,.22);
          animation:
            enter 380ms cubic-bezier(.16,1,.3,1) both;
        }

        .header {
          min-height: 138px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 22px;
          border-bottom:
            1px solid rgba(255,255,255,.055);
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #6f8cff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .13em;
        }

        h1 {
          margin: 0;
          color: #f2f2f3;
          font-size: 22px;
          font-weight: 620;
          letter-spacing: -.035em;
        }

        .header p {
          max-width: 275px;
          margin: 7px 0 0;
          color: #777780;
          font-size: 11.5px;
          line-height: 1.55;
        }

        .previewAvatar {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          color: white;
          font-size: 16px;
          font-weight: 650;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.1) inset,
            0 4px 12px rgba(0,0,0,.18);
        }

        .section {
          padding: 16px 18px;
          border-bottom:
            1px solid rgba(255,255,255,.05);
        }

        .label {
          display: block;
          margin-bottom: 8px;
          color: #c9c9ce;
          font-size: 11.5px;
          font-weight: 550;
        }

        .hint {
          display: block;
          margin-top: 3px;
          color: #64646d;
          font-size: 10.5px;
        }

        .input {
          width: 100%;
          height: 38px;
          padding: 0 11px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          outline: none;
          background: #17171a;
          color: #ececef;
          font-size: 12.5px;
          box-shadow:
            0 1px 0 rgba(255,255,255,.018) inset;
          transition:
            border-color 140ms ease,
            box-shadow 140ms ease,
            background-color 140ms ease;
        }

        .input::placeholder {
          color: #55555e;
        }

        .input:focus {
          border-color: rgba(111,140,255,.65);
          box-shadow:
            0 0 0 2px rgba(111,140,255,.10);
          background: #19191d;
        }

        .colorGrid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 7px;
        }

        .colorButton {
          position: relative;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          transition:
            background-color 120ms ease,
            border-color 120ms ease,
            transform 120ms ease;
        }

        .colorButton:hover {
          background: #19191d;
        }

        .colorButton:active {
          transform: scale(.94);
        }

        .colorButton.active {
          border-color: rgba(255,255,255,.11);
          background: #19191d;
        }

        .colorSwatch {
          position: absolute;
          inset: 4px;
          border-radius: 7px;
        }

        .colorButton svg {
          position: relative;
          z-index: 1;
        }

        .pinSection {
          padding-bottom: 14px;
        }

        .pinHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .pinHeader .label {
          margin: 0;
        }

        .switch {
          position: relative;
          width: 30px;
          height: 18px;
          flex: 0 0 30px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: #28282e;
          transition: background-color 160ms ease;
        }

        .switch span {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #f0f0f2;
          box-shadow: 0 1px 3px rgba(0,0,0,.35);
          transition:
            transform 180ms cubic-bezier(.16,1,.3,1);
        }

        .switchOn {
          background: #6f8cff;
        }

        .switchOn span {
          transform: translateX(12px);
        }

        .pinReveal {
          display: grid;
          overflow: hidden;
          transition:
            grid-template-rows 260ms cubic-bezier(.16,1,.3,1),
            opacity 180ms ease;
        }

        .pinRevealInner {
          min-height: 0;
        }

        .pinInput {
          margin-top: 12px;
          max-width: 110px;
          letter-spacing: .32em;
          font-size: 15px;
          text-align: center;
          font-variant-numeric: tabular-nums;
        }

        .error {
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 12px 18px 0;
          padding: 9px 10px;
          border: 1px solid rgba(227,93,106,.15);
          border-radius: 9px;
          background: rgba(227,93,106,.055);
          color: #c98990;
          font-size: 10.5px;
          line-height: 1.4;
        }

        .errorDot {
          width: 5px;
          height: 5px;
          flex: 0 0 5px;
          border-radius: 50%;
          background: #df626c;
        }

        .footer {
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
          padding: 10px 14px;
          background: #0f0f12;
        }

        .secondaryButton,
        .primaryButton {
          height: 32px;
          padding: 0 12px;
          border-radius: 9px;
          font-size: 11.5px;
          font-weight: 560;
          transition:
            background-color 130ms ease,
            color 130ms ease,
            border-color 130ms ease,
            transform 120ms ease,
            opacity 130ms ease;
        }

        .secondaryButton {
          border: 1px solid rgba(255,255,255,.065);
          background: #17171a;
          color: #8c8c95;
        }

        .secondaryButton:hover {
          background: #1d1d21;
          color: #d0d0d5;
        }

        .primaryButton {
          border: 1px solid rgba(255,255,255,.07);
          background: #f0f0f2;
          color: #111114;
          box-shadow:
            0 1px 0 rgba(255,255,255,.4) inset,
            0 1px 3px rgba(0,0,0,.25);
        }

        .primaryButton:hover {
          background: #ffffff;
        }

        .secondaryButton:active,
        .primaryButton:active {
          transform: scale(.97);
        }

        .primaryButton:disabled {
          cursor: default;
          opacity: .55;
        }

        @keyframes enter {
          from {
            opacity: 0;
            transform: translateY(7px) scale(.99);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 520px) {
          .page {
            padding: 15px 12px;
          }

          .header {
            padding: 19px 17px;
          }

          .section {
            padding-left: 15px;
            padding-right: 15px;
          }

          .colorGrid {
            grid-template-columns: repeat(4, 1fr);
          }

          .colorButton {
            max-width: 42px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .card {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
