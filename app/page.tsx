export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0b0c",
        color: "#f5f5f5",
        padding: "24px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: "12px",
          }}
        >
          Proyecto Fitness
        </h1>

        <p
          style={{
            color: "#8f8f96",
            fontSize: "15px",
            lineHeight: 1.5,
          }}
        >
          La app está funcionando correctamente.
        </p>
      </div>
    </main>
  );
}
