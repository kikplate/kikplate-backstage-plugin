import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderInTestApp } from '@backstage/frontend-test-utils';
import { PlateList } from './PlateList';

describe('PlateList', () => {
  it('renders a grid of plates', async () => {
    const plates = [
      {
        id: '1',
        name: 'FastAPI Starter',
        slug: 'fastapi-starter',
        owner: 'kikplate-public',
        tags: ['python', 'api'],
        description: 'A Python API starter',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'NestJS Starter',
        slug: 'nestjs-starter',
        owner: 'kikplate-public',
        tags: ['nodejs'],
        description: 'A Node.js API starter',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
    ];

    await renderInTestApp(<PlateList plates={plates} />);

    expect(await screen.findByText('FastAPI Starter')).toBeInTheDocument();
    expect(await screen.findByText('NestJS Starter')).toBeInTheDocument();
    expect(await screen.findByText('A Python API starter')).toBeInTheDocument();
  });

  it('calls onSelectPlate when a plate card is clicked', async () => {
    const user = userEvent.setup();
    const onSelectPlate = jest.fn();
    const plates = [
      {
        id: '1',
        name: 'FastAPI Starter',
        slug: 'fastapi-starter',
        owner: 'kikplate-public',
        tags: ['python', 'api'],
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    await renderInTestApp(
      <PlateList plates={plates} onSelectPlate={onSelectPlate} />
    );

    const card = await screen.findByText('FastAPI Starter');
    await user.click(card.closest('div')!);

    expect(onSelectPlate).toHaveBeenCalledWith(plates[0]);
  });

  it('highlights selected plate', async () => {
    const plates = [
      {
        id: '1',
        name: 'FastAPI Starter',
        slug: 'fastapi-starter',
        owner: 'kikplate-public',
        tags: ['python', 'api'],
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ];

    await renderInTestApp(
      <PlateList plates={plates} selectedPlateId="1" />
    );

    const card = await screen.findByText('FastAPI Starter');
    expect(card.closest('div')).toHaveStyle('backgroundColor: #f5f5f5');
  });
});
