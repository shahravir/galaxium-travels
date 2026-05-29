import { useState } from 'react';
import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  TextInput,
  Stack,
} from '@carbon/react';
import { Button } from '../common';
import { getUserByCredentials, registerUser, isErrorResponse } from '../../services/api';
import { useUser } from '../../hooks/useUser';
import toast from 'react-hot-toast';

interface UserIdentificationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserIdentification = ({ isOpen, onClose, onSuccess }: UserIdentificationProps) => {
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

//validate email addresses
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      if (isNewUser) {
        // Register new user
        const result = await registerUser({ name: name.trim(), email: email.trim() });
        
        if (isErrorResponse(result)) {
          toast.error(result.details || result.error);
          return;
        }
        
        setUser(result);
        toast.success('Account created successfully!');
        onSuccess();
        onClose();
      } else {
        // Try to find existing user
        const result = await getUserByCredentials(name.trim(), email.trim());
        
        if (isErrorResponse(result)) {
          // User not found, suggest registration
          toast.error('User not found. Please register or check your credentials.');
          setIsNewUser(true);
          return;
        }
        
        setUser(result);
        toast.success(`Welcome back, ${result.name}!`);
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.details || error.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setIsNewUser(false);
    onClose();
  };

  return (
    <ComposedModal
      open={isOpen}
      onClose={handleClose}
      size="sm"
    >
      <ModalHeader title={isNewUser ? 'Create Account' : 'Sign In'} />
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <Stack gap={5}>
            <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              {isNewUser
                ? 'Create an account to book your flight'
                : 'Enter your name and email to continue'}
            </p>

            <TextInput
              id="user-name"
              labelText="Name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextInput
              id="user-email"
              labelText="Email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Stack>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="secondary"
          onClick={() => setIsNewUser(!isNewUser)}
        >
          {isNewUser
            ? 'Already have an account? Sign in'
            : "Don't have an account? Register"}
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          {isNewUser ? 'Create Account' : 'Continue'}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

// Made with Bob
