import { Button as CarbonButton, InlineLoading } from '@carbon/react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  type = 'button',
  onClick,
}: ButtonProps) => {
  const kindByVariant = {
    primary: 'primary',
    secondary: 'secondary',
    danger: 'danger',
  } as const;

  const sizeByVariant = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  } as const;

  return (
    <CarbonButton
      kind={kindByVariant[variant]}
      size={sizeByVariant[size]}
      className={className}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
    >
      {isLoading ? (
        <InlineLoading description="Loading" status="active" />
      ) : (
        children
      )}
    </CarbonButton>
  );
};

// Made with Bob
