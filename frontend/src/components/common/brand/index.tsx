import { Link } from 'react-router';
import './brand.css';

type BrandSize = 'sm' | 'default' | 'l';

type BrandProps = {
  to: string;
  size?: BrandSize;
  className?: string;
  subtitle?: string;
};

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
}

export function Brand({ to, size = 'default', className, subtitle }: BrandProps) {
  return (
    <Link to={to} data-size={size} className={classes('bread-brand', className)}>
      <img className="bread-brand-logo" src={`${import.meta.env.BASE_URL}brand-logo.svg`} width={44} height={44} alt="" aria-hidden="true" />
      <span className="bread-brand-text">
        <span>温习社</span>
        {subtitle && <small>{subtitle}</small>}
      </span>
    </Link>
  );
}
