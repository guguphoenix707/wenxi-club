import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { styleDemos } from './demos';
import styles from './index.module.css';

function demoIdFromHash(hash: string) {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!value) return '';
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function TestStyle() {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const requestedId = demoIdFromHash(hash);
  const active = styleDemos.find((demo) => demo.id === requestedId) ?? styleDemos[0];
  const ActiveDemo = active.Component;

  useEffect(() => {
    if (requestedId && !styleDemos.some((demo) => demo.id === requestedId)) {
      navigate(`#${styleDemos[0].id}`, { replace: true });
    }
  }, [requestedId, navigate]);

  return (
    <div id={active.id} className={styles.gallery}>
      <title>{`${active.label} · 组件展示 · 面试温习社`}</title>
      <meta name="robots" content="noindex, nofollow" />
      <nav className={styles.nav} aria-label="组件示例">
        <ul className={styles.list}>
          {styleDemos.map((demo) => {
            const current = demo.id === active.id;
            return (
              <li key={demo.id}>
                <Link
                  className={current ? `${styles.link} ${styles.current}` : styles.link}
                  to={`#${demo.id}`}
                  aria-current={current ? 'location' : undefined}
                >
                  {demo.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <ActiveDemo />
    </div>
  );
}
