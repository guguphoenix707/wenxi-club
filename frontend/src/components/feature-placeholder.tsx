import styles from './feature-placeholder.module.css';

//FIXME  delete
export function FeaturePlaceholder({ title, description }: { title: string; description: string }) {
  return <><header><p className={styles.eyebrow}>温习社</p><h1>{title}</h1><p>{description}</p></header><section className={styles.panel}><h2>功能待接入</h2><p>页面入口已就绪，业务接口与数据持久化尚未实现。</p></section></>;
}
