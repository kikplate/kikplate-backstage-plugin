import { Progress } from '@backstage/core-components';
import {
  configApiRef,
  useApi,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { Header, Container } from '@backstage/ui';
import { useEffect, useMemo, useState } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { useTheme } from '@material-ui/core/styles';
import { PlateList } from '../PlateList';
import type { PlateItem } from '../PlateList';
import { PlateDetail } from '../PlateDetail';
import { NotFound } from '../NotFound';

const DEFAULT_PLATES_ENDPOINT = '/api/proxy/kikplate-api/plates';
const DEFAULT_PAGE_SIZE = 20;

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  return undefined;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }

  return undefined;
};

const toPlate = (input: unknown): PlateItem | undefined => {
  if (!input || typeof input !== 'object') {
    return undefined;
  }

  const row = input as Record<string, unknown>;
  const id = asString(row.id) ?? asString(row.slug) ?? asString(row.name);
  const name = asString(row.name) ?? asString(row.title) ?? id;
  const slug = asString(row.slug) ?? asString(row.name) ?? id;

  if (!id || !name || !slug) {
    return undefined;
  }

  const tags = Array.isArray(row.tags)
    ? row.tags
        .map(item => {
          if (typeof item === 'string') {
            return asString(item);
          }

          const tagRow = asRecord(item);
          if (!tagRow) {
            return undefined;
          }

          return (
            asString(tagRow.tag) ??
            asString(tagRow.name) ??
            asString(tagRow.slug)
          );
        })
        .filter((tag): tag is string => Boolean(tag))
    : [];

  const badges = Array.isArray(row.badges)
    ? row.badges
        .map(item => {
          if (typeof item === 'string') {
            return asString(item);
          }

          const badgeRow = asRecord(item);
          if (!badgeRow) {
            return undefined;
          }

          const nestedBadge = asRecord(badgeRow.badge);

          return (
            asString(badgeRow.name) ??
            asString(badgeRow.slug) ??
            asString(nestedBadge?.name) ??
            asString(nestedBadge?.slug)
          );
        })
        .filter((badge): badge is string => Boolean(badge))
    : [];

  return {
    id,
    name,
    slug,
    owner: asString(row.owner) ?? asString(row.organization),
    description: asString(row.description) ?? asString(row.summary),
    tags,
    badges,
    updatedAt:
      asString(row.updatedAt) ??
      asString(row.updated_at) ??
      asString(row.createdAt) ??
      asString(row.created_at),
    gitUrl: asString(row.repo_url) ?? asString(row.repository) ?? asString(row.repositoryUrl),
    repositoryUrl: asString(row.repo_url) ?? asString(row.repository_url),
  };
};

const toPlateList = (payload: unknown): PlateItem[] => {
  const root = payload as Record<string, unknown>;
  const collection = Array.isArray(payload)
    ? payload
    : Array.isArray(root?.items)
      ? root.items
      : Array.isArray(root?.plates)
        ? root.plates
        : Array.isArray(root?.data)
          ? root.data
          : [];

  return collection
    .map(toPlate)
    .filter((plate): plate is PlateItem => Boolean(plate));
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

type PlatePage = {
  items: PlateItem[];
  total: number;
};

const toPlatePage = (payload: unknown): PlatePage => {
  const items = toPlateList(payload);
  const root = payload as Record<string, unknown>;
  const total = asNumber(root?.total) ?? items.length;

  return { items, total };
};

function usePlates(platesEndpoint: string, page: number, limit: number) {
  const { fetch } = useApi(fetchApiRef);

  return useAsync(async (): Promise<PlatePage> => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const response = await fetch(`${platesEndpoint}?${params.toString()}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch plates: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return toPlatePage(data);
  }, [fetch, platesEndpoint, page, limit]);
}

export const PlatesPage = () => {
  const theme = useTheme();
  const configApi = useApi(configApiRef);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedPlateId, setSelectedPlateId] = useState<string | undefined>();

  const backendBaseUrl =
    configApi.getOptionalString('backend.baseUrl')?.replace(/\/+$/, '') ?? '';
  const platesEndpoint = `${backendBaseUrl}/api/proxy/kikplate-api/plates`;

  const { value: platePage, loading, error } = usePlates(
    backendBaseUrl ? platesEndpoint : DEFAULT_PLATES_ENDPOINT,
    page,
    pageSize,
  );

  const plates = platePage?.items ?? [];
  const totalPlates = platePage?.total ?? plates.length;
  const totalPages = Math.max(1, Math.ceil(totalPlates / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const filteredPlates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return plates;
    }

    return plates.filter(plate => {
      const haystack = [
        plate.name,
        plate.slug,
        plate.owner,
        plate.description,
        plate.tags.join(' '),
        plate.badges.join(' '),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [plates, search]);

  const selectedPlate =
    filteredPlates.find(p => p.id === selectedPlateId) ?? null;

  if (loading) {
    return <Progress />;
  }

  return (
    <>
      <Header title="Plates" />
      <Container>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '16px',
            gap: '12px',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '14px',
            padding: '14px',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              aria-label="Search plates"
              placeholder="Search plates by name, slug, owner, tags..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '10px',
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                fontSize: '14px',
                boxSizing: 'border-box',
                boxShadow: 'none',
              }}
            />
            {search.trim() ? (
              <button
                onClick={() => {
                  setSearch('');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            ) : null}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: theme.palette.text.secondary,
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span>
              Showing {filteredPlates.length} of {plates.length} on page {page}
              {' '}({totalPlates} total)
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label htmlFor="page-size" style={{ fontSize: '12px' }}>
                Per page
              </label>
              <select
                id="page-size"
                value={pageSize}
                onChange={event => {
                  const nextSize = Number(event.target.value);
                  setPageSize(nextSize);
                  setPage(1);
                }}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  fontSize: '12px',
                }}
              >
                {[12, 20, 24, 48].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            {error ? (
              <div
                role="alert"
                style={{ color: theme.palette.error.main, marginTop: '8px' }}
              >
                Unable to load plates from the configured Kikplate API server.
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: selectedPlate
              ? 'minmax(0, 1fr) minmax(360px, 42%)'
              : '1fr',
            gap: '0',
            borderRadius: '14px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'visible',
            backgroundColor: theme.palette.background.default,
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {filteredPlates.length > 0 ? (
              <PlateList
                plates={filteredPlates}
                onSelectPlate={plate => setSelectedPlateId(plate.id)}
                selectedPlateId={selectedPlateId}
              />
            ) : (
              <NotFound searchQuery={search.trim() || undefined} />
            )}
          </div>
          {selectedPlate ? (
            <PlateDetail
              plate={selectedPlate}
              onClose={() => setSelectedPlateId(undefined)}
            />
          ) : null}
        </div>

        <div
          style={{
            marginTop: '14px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => {
              setPage(prev => Math.max(1, prev - 1));
              setSelectedPlateId(undefined);
            }}
            disabled={page <= 1}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              color: page <= 1 ? theme.palette.text.disabled : theme.palette.text.primary,
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            Previous
          </button>
          <span
            style={{
              fontSize: '12px',
              color: theme.palette.text.secondary,
              minWidth: '120px',
              textAlign: 'center',
            }}
          >
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => {
              setPage(prev => Math.min(totalPages, prev + 1));
              setSelectedPlateId(undefined);
            }}
            disabled={page >= totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              color:
                page >= totalPages
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary,
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              fontSize: '12px',
            }}
          >
            Next
          </button>
        </div>
      </Container>
    </>
  );
};
