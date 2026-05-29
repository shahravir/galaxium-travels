import type { ChangeEvent } from 'react';
import { TextInput } from '@carbon/react';

interface InputProps {
  id?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

export const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <TextInput
      id={props.id || props.name || label || 'input-field'}
      labelText={label || ''}
      invalid={Boolean(error)}
      invalidText={error}
      className={className}
      {...props}
    />
  );
};

// Made with Bob
