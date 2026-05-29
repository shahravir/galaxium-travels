import { Link, useLocation } from 'react-router-dom';
import {
  Header as CarbonHeader,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from '@carbon/react';
import { Rocket, User, Logout } from '@carbon/icons-react';
import { useUser } from '../../hooks/useUser';

export const Header = () => {
  const location = useLocation();
  const { user, logout } = useUser();

  const isActive = (path: string) => location.pathname === path;

  return (
    <HeaderContainer
      render={() => (
        <CarbonHeader aria-label="Galaxium Travels">
          <SkipToContent />
          <HeaderName as={Link} to="/" prefix="">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Rocket size={24} />
              <span>Galaxium Travels</span>
            </div>
          </HeaderName>
          <HeaderNavigation aria-label="Galaxium Travels">
            <HeaderMenuItem
              as={Link}
              to="/"
              isActive={isActive('/')}
            >
              Home
            </HeaderMenuItem>
            <HeaderMenuItem
              as={Link}
              to="/flights"
              isActive={isActive('/flights')}
            >
              Flights
            </HeaderMenuItem>
            {user && (
              <HeaderMenuItem
                as={Link}
                to="/bookings"
                isActive={isActive('/bookings')}
              >
                My Bookings
              </HeaderMenuItem>
            )}
          </HeaderNavigation>
          <HeaderGlobalBar>
            {user ? (
              <>
                <HeaderGlobalAction
                  aria-label={`Logged in as ${user.name}`}
                  tooltipAlignment="end"
                >
                  <User size={20} />
                </HeaderGlobalAction>
                <HeaderGlobalAction
                  aria-label="Logout"
                  onClick={logout}
                  tooltipAlignment="end"
                >
                  <Logout size={20} />
                </HeaderGlobalAction>
              </>
            ) : (
              <Link to="/flights" style={{ textDecoration: 'none' }}>
                <HeaderGlobalAction
                  aria-label="Book a Flight"
                  tooltipAlignment="end"
                >
                  <Rocket size={20} />
                </HeaderGlobalAction>
              </Link>
            )}
          </HeaderGlobalBar>
        </CarbonHeader>
      )}
    />
  );
};

// Made with Bob
