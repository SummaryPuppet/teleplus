import { useMemo } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

function PasswordStrengthBar({ password }) {
  const criteria = useMemo(() => [
    { label: "8 o más caracteres", test: (p) => p.length >= 8 },
    { label: "Una mayúscula", test: (p) => /[A-Z]/.test(p) },
    { label: "Una minúscula", test: (p) => /[a-z]/.test(p) },
    { label: "Un número", test: (p) => /[0-9]/.test(p) },
    { label: "Un carácter especial", test: (p) => /[!@#$%^&*(),.?\":{}|<>]/.test(p) },
  ], []);

  const score = useMemo(() => {
    if (!password) return 0;
    return criteria.filter((c) => c.test(password)).length;
  }, [password, criteria]);

  const getLevel = () => {
    if (score <= 1) return { label: "Bajo", color: "#dc3545", width: "20%" };
    if (score <= 2) return { label: "Medio", color: "#fd7e14", width: "45%" };
    if (score <= 3) return { label: "Medio", color: "#ffc107", width: "65%" };
    if (score <= 4) return { label: "Bueno", color: "#ffc107", width: "80%" };
    return { label: "Fuerte", color: "#198754", width: "100%" };
  };

  if (!password) return null;

  const level = getLevel();

  return (
    <div className="mt-2 mb-3">
      <div
        className="rounded-pill overflow-hidden"
        style={{ height: "6px", backgroundColor: "#e9ecef" }}
      >
        <div
          className="h-100 rounded-pill"
          style={{
            width: level.width,
            backgroundColor: level.color,
            transition: "width 0.3s, background-color 0.3s",
          }}
        />
      </div>

      <div className="d-flex justify-content-between align-items-center mt-1">
        <small className="fw-semibold" style={{ color: level.color, fontSize: "0.75rem" }}>
          {level.label}
        </small>
        <small className="text-muted" style={{ fontSize: "0.7rem" }}>
          {score}/5
        </small>
      </div>

      <div className="mt-1" style={{ fontSize: "0.72rem" }}>
        {criteria.map((c, i) => {
          const passed = c.test(password);
          return (
            <span
              key={i}
              className="d-inline-flex align-items-center me-2 mb-1"
              style={{ color: passed ? "#198754" : "#6c757d" }}
            >
              {passed ? <FaCheck size={9} className="me-1" /> : <FaTimes size={9} className="me-1" />}
              {c.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default PasswordStrengthBar;
