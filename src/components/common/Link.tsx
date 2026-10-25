import React from 'react';
import { useStore } from '../../context/StoreContext';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

export const Link: React.FC<LinkProps> = ({ href, children, className, external, onClick, ...rest }) => {
  const { navigate } = useStore();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && !external && !href.startsWith('#')) {
      navigate(href, e);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
};
