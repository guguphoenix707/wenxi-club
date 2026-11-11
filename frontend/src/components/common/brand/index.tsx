import { Link } from 'react-router';
import './brand.css';

type BrandSize = 'sm' | 'default' | 'l';

type BrandProps = {
  to: string;
  size?: BrandSize;
  className?: string;
};

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
}

export function Brand({ to, size = 'default', className }: BrandProps) {
  return (
    <Link to={to} data-size={size} className={classes('bread-brand', className)}>
      <span>M</span>
      温习社
    </Link>
  );
}
