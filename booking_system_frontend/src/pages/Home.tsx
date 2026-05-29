import { Link } from 'react-router-dom';
import { Grid, Column, Tile, Stack, Heading, ButtonSet } from '@carbon/react';
import { Rocket, Earth, Security, Lightning } from '@carbon/icons-react';
import { Button } from '../components/common';
import './Home.css';

export const Home = () => {
  const features = [
    {
      icon: <Rocket size={32} />,
      title: 'Interplanetary Travel',
      description: 'Explore destinations across the solar system with our state-of-the-art spacecraft.',
    },
    {
      icon: <Earth size={32} />,
      title: 'Multiple Destinations',
      description: 'From Mars to Europa, discover new worlds and book your journey today.',
    },
    {
      icon: <Security size={32} />,
      title: 'Safe & Secure',
      description: 'Your safety is our priority with advanced navigation and life support systems.',
    },
    {
      icon: <Lightning size={32} />,
      title: 'Instant Booking',
      description: 'Book your flight in seconds and receive instant confirmation.',
    },
  ];

  return (
    <div className="home-page">
      <Grid>
        <Column sm={4} md={8} lg={16}>
          <Stack gap={10}>
            {/* Hero Section */}
            <div className="home-hero">
              <Heading className="home-hero-title">
                Journey Beyond The Stars
              </Heading>
              <p className="home-hero-description">
                Experience the future of space travel with Galaxium. Book your
                interplanetary flight and explore the wonders of our solar system.
              </p>
              <ButtonSet>
                <Link to="/flights">
                  <Button size="lg">
                    Explore Flights
                  </Button>
                </Link>
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </ButtonSet>
            </div>

            {/* Features Section */}
            <div className="home-features">
              <Heading className="home-section-title">
                Why Choose Galaxium?
              </Heading>

              <Grid narrow>
                {features.map((feature, index) => (
                  <Column key={index} sm={4} md={4} lg={4}>
                    <Tile className="home-feature-tile">
                      <div className="home-feature-icon cosmic-gradient">
                        {feature.icon}
                      </div>
                      <h3 className="home-feature-title">
                        {feature.title}
                      </h3>
                      <p className="home-feature-description">{feature.description}</p>
                    </Tile>
                  </Column>
                ))}
              </Grid>
            </div>

            {/* CTA Section */}
            <Tile className="home-cta cosmic-gradient">
              <Heading className="home-cta-title">
                Ready for Your Space Adventure?
              </Heading>
              <p className="home-cta-description">
                Join thousands of space travelers who have already booked their
                journey to the stars. Your adventure awaits!
              </p>
              <Link to="/flights">
                <Button variant="secondary" size="lg">
                  Book Your Flight Now
                </Button>
              </Link>
            </Tile>
          </Stack>
        </Column>
      </Grid>
    </div>
  );
};

// Made with Bob
