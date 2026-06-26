import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import {
  registerMswTestHooks,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { PlatesPage } from './PlatesPage';

describe('PlatesPage', () => {
  const server = setupServer();
  registerMswTestHooks(server);

  it('renders plates from the Kikplate API', async () => {
    server.use(
      rest.get('*/api/proxy/kikplate-api/plates', (_, res, ctx) =>
        res(
          ctx.json({
            items: [
              { 
                id: '1', 
                name: 'FastAPI Starter', 
                slug: 'fastapi-starter', 
                owner: 'kikplate-public', 
                tags: ['python'],
                gitUrl: 'https://github.com/kikplate/fastapi-starter',
              },
            ],
          }),
        ),
      ),
    );

    await renderInTestApp(<PlatesPage />);

    expect(await screen.findByText('FastAPI Starter')).toBeInTheDocument();
  });

  it('shows an error when the Kikplate API fails', async () => {
    server.use(
      rest.get('*/api/proxy/kikplate-api/plates', (_, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: 'Internal Server Error' })),
      ),
    );

    await renderInTestApp(<PlatesPage />);

    expect(
      await screen.findByText(
        'Unable to load plates from the configured Kikplate API server.',
      ),
    ).toBeInTheDocument();
  });

  it('shows not found view when no plates are available', async () => {
    server.use(
      rest.get('*/api/proxy/kikplate-api/plates', (_, res, ctx) =>
        res(ctx.json({ items: [] })),
      ),
    );

    await renderInTestApp(<PlatesPage />);

    expect(
      await screen.findByText('No plates available'),
    ).toBeInTheDocument();
  });

  it('shows not found view when search yields no results', async () => {
    const user = userEvent.setup();
    server.use(
      rest.get('*/api/proxy/kikplate-api/plates', (_, res, ctx) =>
        res(
          ctx.json({
            items: [
              { 
                id: '1', 
                name: 'FastAPI Starter', 
                slug: 'fastapi-starter', 
                owner: 'kikplate-public', 
                tags: ['python'],
                gitUrl: 'https://github.com/kikplate/fastapi-starter',
              },
            ],
          }),
        ),
      ),
    );

    await renderInTestApp(<PlatesPage />);

    expect(await screen.findByText('FastAPI Starter')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(
      'Search plates by name, slug, owner, tags...',
    );
    await user.type(searchInput, 'non-existent-plate');

    expect(await screen.findByText('No plates found')).toBeInTheDocument();
    expect(
      screen.getByText(/Try adjusting your search/),
    ).toBeInTheDocument();
  });
});
