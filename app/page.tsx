import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
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
        <p>Error conectando con Supabase: {error.message}</p>
      </main>
    );
  }

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
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
          }}
        >
          Proyecto Fitness
        </h1>

        <p
          style={{
            color: "#8f8f96",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          Perfiles encontrados: {profiles?.length ?? 0}
        </p>

        {profiles?.map((profile) => (
          <div
            key={profile.id}
            style={{
              padding: "16px",
              marginBottom: "10px",
              borderRadius: "16px",
              background: "#151518",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: profile.color,
                marginBottom: "10px",
              }}
            />

            <strong>{profile.name}</strong>
          </div>
        ))}
      </div>
    </main>
  );
}
