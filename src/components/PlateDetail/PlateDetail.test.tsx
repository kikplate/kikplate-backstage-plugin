import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { PlateDetail } from './PlateDetail';

// Mock fetch
global.fetch = jest.fn();

describe('PlateDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });
  });

  it('renders null when no plate is selected', async () => {
    const onClose = jest.fn();
    const { container } = await renderInTestApp(
      <PlateDetail plate={null} onClose={onClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays info tab by default', async () => {
    const plate = {
      id: '1',
      name: 'FastAPI Starter',
      slug: 'fastapi-starter',
      owner: 'kikplate-public',
      description: 'A Python API starter template',
      tags: ['python', 'api'],
      updatedAt: '2025-01-01T12:00:00.000Z',
      gitUrl: 'https://github.com/kikplate/fastapi-starter',
    };
    const onClose = jest.fn();

    await renderInTestApp(<PlateDetail plate={plate} onClose={onClose} />);

    expect(await screen.findByText('FastAPI Starter')).toBeInTheDocument();
    expect(await screen.findByText('fastapi-starter')).toBeInTheDocument();
  });

  it('renders all three tabs', async () => {
    const plate = {
      id: '1',
      name: 'FastAPI Starter',
      slug: 'fastapi-starter',
      owner: 'kikplate-public',
      tags: [],
    };
    const onClose = jest.fn();

    await renderInTestApp(<PlateDetail plate={plate} onClose={onClose} />);

    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Schema')).toBeInTheDocument();
    expect(screen.getByText('Generation')).toBeInTheDocument();
  });

  it('displays git repository URL', async () => {
    const plate = {
      id: '1',
      name: 'FastAPI Starter',
      slug: 'fastapi-starter',
      tags: [],
      gitUrl: 'https://github.com/kikplate/fastapi-starter',
    };
    const onClose = jest.fn();

    await renderInTestApp(<PlateDetail plate={plate} onClose={onClose} />);

    const repoLink = screen.getByText('https://github.com/kikplate/fastapi-starter');
    expect(repoLink).toBeInTheDocument();
    expect(repoLink).toHaveAttribute('href', 'https://github.com/kikplate/fastapi-starter');
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const plate = {
      id: '1',
      name: 'FastAPI Starter',
      slug: 'fastapi-starter',
      tags: [],
    };
    const onClose = jest.fn();

    await renderInTestApp(<PlateDetail plate={plate} onClose={onClose} />);

    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
