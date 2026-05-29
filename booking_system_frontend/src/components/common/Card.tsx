import type { ReactNode } from 'react';
import clsx from 'clsx';
import { ClickableTile, Tile } from '@carbon/react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, hover = false, onClick }: CardProps) => {
  if (onClick) {
    return (
      <ClickableTile
        className={clsx('w-full text-left', hover && 'cursor-pointer', className)}
        onClick={onClick}
      >
        {children}
      </ClickableTile>
    );
  }

  return <Tile className={className}>{children}</Tile>;
};

// Made with Bob
