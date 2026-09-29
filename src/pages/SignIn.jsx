import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignIn() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) return <Navigate to="/products" replace />;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError("Enter a valid email address.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    try {
      await signIn(email, password);
      navigate(location.state?.from?.pathname || "/products", { replace: true });
    } catch {
      setError("Invalid email or password, or the API is not running.");
    }
  }

  return (
    <main className="signin">
      <form className="panel" onSubmit={handleSubmit} noValidate>
        <h1>Duka Stock</h1>
        <p className="muted">Sign in to manage your shelf.</p>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit">Sign in</button>
      </form>
    </main>
  );
}
