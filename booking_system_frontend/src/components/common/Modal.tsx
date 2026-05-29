import type { ReactNode } from 'react';
import { ComposedModal, ModalHeader, ModalBody } from '@carbon/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const sizeByModal = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  } as const;

  return (
    <ComposedModal
      open={isOpen}
      onClose={onClose}
      size={sizeByModal[size]}
    >
      <ModalHeader title={title || ''} />
      <ModalBody>{children}</ModalBody>
    </ComposedModal>
  );
};

// Made with Bob
