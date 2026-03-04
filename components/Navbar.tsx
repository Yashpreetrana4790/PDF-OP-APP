'use client';

import Link from 'next/link';
import { useState } from 'react';
import { TOOLS, CATEGORIES } from '@/lib/tools';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);

  const toolsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    tools: TOOLS.filter((t) => t.category === cat.id),
  }));

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>PDF</span>
          <span className={styles.logoText}>Tools</span>
        </Link>

        <div className={styles.links}>
          <div
            className={styles.dropdownWrap}
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
          >
            <button className={styles.dropdownTrigger} aria-expanded={toolsOpen}>
              All Tools
            </button>
            {toolsOpen && (
              <div className={styles.dropdown}>
                {toolsByCategory.map((cat) => (
                  <div key={cat.id} className={styles.dropdownSection}>
                    <span className={styles.dropdownSectionTitle}>{cat.label}</span>
                    {cat.tools.map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.slug}`}
                        className={styles.dropdownItem}
                        onClick={() => setToolsOpen(false)}
                      >
                        <span className={styles.dropdownIcon}>{tool.icon}</span>
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
        </div>

        <div className={styles.actions}>
          <Link href="/login" className={styles.loginBtn}>
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
