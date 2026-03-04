import Link from 'next/link';
import { TOOLS, CATEGORIES } from '@/lib/tools';
import styles from './page.module.css';

export default function HomePage() {
  const toolsByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    tools: TOOLS.filter((t) => t.category === cat.id),
  }));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Free PDF Tools for Everyone
        </h1>
        <p className={styles.heroSubtitle}>
          Merge, split, compress, convert and more — all in your browser. No signup required.
        </p>
      </section>

      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>All PDF Tools</h2>
        <div className={styles.toolsGrid}>
          {TOOLS.map((tool, index) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              className={styles.toolCard}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className={styles.toolIcon}>{tool.icon}</span>
              <h3 className={styles.toolName}>{tool.name}</h3>
              <p className={styles.toolDesc}>{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.categoriesSection}>
        {toolsByCategory.map((cat) => (
          <div key={cat.id} className={styles.categoryBlock}>
            <h3 className={styles.categoryTitle}>{cat.label}</h3>
            <div className={styles.categoryGrid}>
              {cat.tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className={styles.categoryCard}
                >
                  <span className={styles.categoryCardIcon}>{tool.icon}</span>
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} PDF Tools. Free to use.</p>
      </footer>
    </div>
  );
}
