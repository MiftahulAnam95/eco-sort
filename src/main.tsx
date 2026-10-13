import { Component, StrictMode, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Menampilkan bantuan yang jelas jika terjadi error saat React merender aplikasi. */
class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("EcoSort gagal dirender:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="boot-screen" role="alert">
          <div className="boot-card">
            <div className="boot-mark" aria-hidden="true">!</div>
            <h1>EcoSort tidak dapat dibuka</h1>
            <p>Terjadi kendala saat menampilkan aplikasi. Muat ulang halaman atau buka hasil build EcoSort.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                marginTop: 18,
                border: 0,
                borderRadius: 10,
                padding: "11px 16px",
                background: "#176747",
                color: "white",
                font: "inherit",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Muat ulang halaman
            </button>
            <details>
              <summary>Cara menjalankan aplikasi</summary>
              <ol>
                <li>Untuk pengembangan, jalankan <code>npm install</code> lalu <code>npm run dev</code>.</li>
                <li>Untuk file siap pakai, jalankan <code>npm run build</code> lalu buka <code>dist/index.html</code>.</li>
              </ol>
            </details>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Elemen #root tidak ditemukan. Pastikan index.html memuat <div id=\"root\">.");
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
