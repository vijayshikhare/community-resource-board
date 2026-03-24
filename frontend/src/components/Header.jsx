import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: isScrolled ? "rgba(255, 255, 255, 0.95)" : "#fff",
          backdropFilter: isScrolled ? "blur(10px)" : "none",
          padding: "15px 0",
          boxShadow: isScrolled
            ? "0 4px 20px rgba(0, 0, 0, 0.08)"
            : "0 2px 6px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 clamp(1rem, 4vw, 2rem)",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "transform 0.2s ease",
              letterSpacing: "-0.02em",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div
              style={{
                width: "45px",
                height: "45px",
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ color: "white" }}>🌐</span>
            </div>
            <span>CRB</span>
          </Link>

          {/* Desktop Navbar Links */}
          <nav className="desktop-nav" style={{ display: "flex" }}>
            <ul
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              <li>
                <Link 
                  to="/"
                  style={{
                    padding: "0.5rem 1rem",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    color: "#4b5563",
                    textDecoration: "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    display: "inline-block"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(22, 163, 74, 0.1)";
                    e.currentTarget.style.color = "#16a34a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#4b5563";
                  }}
                >
                  🏠 Home
                </Link>
              </li>

              {user ? (
                <>
                  <li>
                    <Link 
                      to="/dashboard"
                      style={{
                        padding: "0.5rem 1rem",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        color: "#4b5563",
                        textDecoration: "none",
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        display: "inline-block"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(22, 163, 74, 0.1)";
                        e.currentTarget.style.color = "#16a34a";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#4b5563";
                      }}
                    >
                      📊 Dashboard
                    </Link>
                  </li>

                  {user.role === "organizer" && (
                    <li>
                      <Link 
                        to="/organizer"
                        style={{
                          padding: "0.5rem 1rem",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "#4b5563",
                          textDecoration: "none",
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                          display: "inline-block"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(22, 163, 74, 0.1)";
                          e.currentTarget.style.color = "#16a34a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#4b5563";
                        }}
                      >
                        📅 Organizer
                      </Link>
                    </li>
                  )}

                  {user.role === "admin" && (
                    <li>
                      <Link 
                        to="/admin"
                        style={{
                          padding: "0.5rem 1rem",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "#4b5563",
                          textDecoration: "none",
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                          display: "inline-block"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(22, 163, 74, 0.1)";
                          e.currentTarget.style.color = "#16a34a";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#4b5563";
                        }}
                      >
                        ⚙️ Admin
                      </Link>
                    </li>
                  )}

                  <li>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      background: "rgba(22, 163, 74, 0.1)",
                      borderRadius: "8px"
                    }}>
                      <span style={{ fontSize: "1rem" }}>👤</span>
                      <span style={{ fontWeight: 600, color: "#15803d", fontSize: "0.875rem" }}>
                        {user.username || user.name}
                      </span>
                    </div>
                  </li>

                  <li>
                    <button
                      onClick={handleLogout}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "transparent",
                        border: "2px solid #ef4444",
                        color: "#ef4444",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#ef4444";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#ef4444";
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/login"
                      style={{
                        padding: "0.5rem 1rem",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        color: "#16a34a",
                        textDecoration: "none",
                        borderRadius: "8px",
                        border: "2px solid #16a34a",
                        transition: "all 0.2s ease",
                        background: "transparent",
                        display: "inline-block"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(22, 163, 74, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register"
                      style={{
                        padding: "0.5rem 1.25rem",
                        fontWeight: 600,
                        fontSize: "0.9375rem",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "8px",
                        background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 8px rgba(22, 163, 74, 0.3)",
                        display: "inline-block"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(22, 163, 74, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(22, 163, 74, 0.3)";
                      }}
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-btn"
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.5rem",
              color: "#4b5563",
            }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className="mobile-nav"
          style={{
            display: "none",
            flexDirection: "column",
            gap: "0.5rem",
            padding: isMobileMenuOpen ? "1rem" : "0",
            maxHeight: isMobileMenuOpen ? "500px" : "0",
            overflow: "hidden",
            transition: "all 0.3s ease",
            background: "white",
            borderTop: isMobileMenuOpen ? "1px solid rgba(0, 0, 0, 0.08)" : "none",
          }}
        >
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              padding: "0.75rem 1rem",
              fontWeight: 600,
              fontSize: "1rem",
              color: "#4b5563",
              textDecoration: "none",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              display: "block"
            }}
          >
            🏠 Home
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#4b5563",
                  textDecoration: "none",
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  display: "block"
                }}
              >
                📊 Dashboard
              </Link>

              {user.role === "organizer" && (
                <Link
                  to="/organizer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    padding: "0.75rem 1rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#4b5563",
                    textDecoration: "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    display: "block"
                  }}
                >
                  📅 Organizer
                </Link>
              )}

              {user.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    padding: "0.75rem 1rem",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#4b5563",
                    textDecoration: "none",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                    display: "block"
                  }}
                >
                  ⚙️ Admin
                </Link>
              )}

              <div style={{
                height: "1px",
                background: "rgba(0, 0, 0, 0.08)",
                margin: "0.5rem 0",
              }}></div>

              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(22, 163, 74, 0.1)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>👤</span>
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "#15803d" }}>
                  {user.username || user.name}
                </span>
              </div>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  padding: "0.75rem 1rem",
                  background: "#ef4444",
                  border: "none",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#16a34a",
                  textDecoration: "none",
                  borderRadius: "8px",
                  border: "2px solid #16a34a",
                  textAlign: "center",
                  background: "transparent",
                  display: "block"
                }}
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: "0.75rem 1rem",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                  textAlign: "center",
                  display: "block"
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .mobile-nav {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;