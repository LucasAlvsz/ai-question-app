"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    const existingUserId = localStorage.getItem("userId");
    if (existingUserId) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = () => {
    if (!email || !senha) return;

    const userId = uuidv4();
    localStorage.setItem("userId", userId);
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <button className={styles.button} onClick={handleLogin}>
        Entrar
      </button>
    </div>
  );
}
