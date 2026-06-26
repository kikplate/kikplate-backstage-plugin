import { screen } from '@testing-library/react';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('renders with default message when no search query', async () => {
    await renderInTestApp(<NotFound />);

    expect(screen.getByText('No plates available')).toBeInTheDocument();
    expect(
      screen.getByText(
        'No plates are currently available from the Kikplate API.',
      ),
    ).toBeInTheDocument();
  });

  it('renders with search-specific message when search query is provided', async () => {
    await renderInTestApp(<NotFound searchQuery="non-existent" />);

    expect(screen.getByText('No plates found')).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search/)).toBeInTheDocument();
    expect(screen.getByText(/non-existent/)).toBeInTheDocument();
  });
});
