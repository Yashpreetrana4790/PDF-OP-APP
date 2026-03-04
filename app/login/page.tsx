'use client';

import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>
        <p className={styles.desc}>Sign in to save your files and access premium features.</p>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Email" className={styles.input} />
          <input type="password" placeholder="Password" className={styles.input} />
          <button type="submit" className={styles.btn}>Sign in</button>
        </form>
        <p className={styles.footer}>
          Don&apos;t have an account? <Link href="/">Use tools without account</Link>
        </p>
      </div>
    </div>
  );
}
