import type { ReactNode } from 'react';
import { Grid, Column, Content } from '@carbon/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Starfield } from '../common/Starfield';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Animated starfield background */}
      <Starfield />
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(10, 25, 41, 0.95)',
            color: '#F9FAFB',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F9FAFB',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#F9FAFB',
            },
          },
        }}
      />
      
      {/* Header */}
      <Header />
      
      {/* Main content */}
      <Content style={{ position: 'relative', zIndex: 10, flex: 1 }}>
        <Grid>
          <Column sm={4} md={8} lg={16}>
            {children}
          </Column>
        </Grid>
      </Content>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Made with Bob
