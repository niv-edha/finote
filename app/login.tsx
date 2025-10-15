import React, { useState } from 'react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarName, setAvatarName] = useState('');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAvatarImage(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onLogin(); // Switch to main app view!
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)"
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0px 4px 32px rgba(60,60,128,0.08)",
        padding: 36,
        minWidth: 350,
        maxWidth: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h1 style={{
          color: "#6246ea",
          fontSize: "2.2rem",
          marginBottom: 6,
          letterSpacing: 1
        }}>FINOTE</h1>
        <span style={{ color: "#555", marginBottom: 24, fontStyle: "italic" }}>
          keep track and stay productive
        </span>
        <input
          type="email"
          value={email}
          required
          placeholder="Email"
          style={inputStyle}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          value={password}
          required
          placeholder="Password"
          style={inputStyle}
          onChange={e => setPassword(e.target.value)}
        />
        <div style={{ margin: "14px 0" }}>
          <label>
            {avatarImage
              ? <img src={avatarImage} alt="" style={{ width: 70, height: 70, borderRadius: "50%" }} />
              : <div style={{
                  width: 70, height: 70, borderRadius: "50%",
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa", fontSize: "0.9rem"
                }}>
                  Choose Image
                </div>}
            <input style={{ display: "none" }} type="file" accept="image/*" onChange={handleImage} />
          </label>
        </div>
        <input
          type="text"
          value={avatarName}
          required
          placeholder="Avatar Name"
          style={inputStyle}
          onChange={e => setAvatarName(e.target.value)}
        />
        <button type="submit" style={{
          background: "#6246ea",
          color: "#fff",
          border: "none",
          padding: "0.75em 2em",
          borderRadius: 12,
          fontWeight: "bold",
          fontSize: "1.08em",
          marginTop: 12,
          boxShadow: "0 1px 9px rgba(60,60,90,.08)",
          cursor: "pointer"
        }}>
          Login
        </button>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.76em',
  borderRadius: 10,
  border: '1px solid #d1c4e9',
  marginBottom: 12,
  marginTop: 2,
  fontSize: '1.03em'
};
