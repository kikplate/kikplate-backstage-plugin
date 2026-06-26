import { useTheme } from '@material-ui/core/styles';

export type PlateItem = {
  id: string;
  name: string;
  slug: string;
  owner?: string;
  description?: string;
  tags?: string[];
  badges?: string[];
  updatedAt?: string;
  gitUrl?: string;
  repositoryUrl?: string;
};

export interface PlateListProps {
  plates: PlateItem[];
  onSelectPlate?: (plate: PlateItem) => void;
  selectedPlateId?: string;
}

export const PlateList = ({
  plates,
  onSelectPlate,
  selectedPlateId,
}: PlateListProps) => {
  const theme = useTheme();
  const hoverShadowColor =
    theme.palette.type === 'dark'
      ? 'rgba(0, 0, 0, 0.35)'
      : 'rgba(0, 0, 0, 0.12)';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '18px',
        padding: '20px',
        alignContent: 'start',
      }}
    >
      {plates.map(plate => (
        <div
          key={plate.id}
          onClick={() => onSelectPlate?.(plate)}
          style={{
            padding: '16px',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor:
              selectedPlateId === plate.id
                ? theme.palette.action.hover
                : theme.palette.background.paper,
            borderColor:
              selectedPlateId === plate.id
                ? theme.palette.primary.main
                : theme.palette.divider,
            boxShadow: 'none',
            transform: 'translateY(0px)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            if (selectedPlateId !== plate.id) {
              (e.currentTarget as HTMLElement).style.boxShadow =
                `0 10px 20px ${hoverShadowColor}`;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.borderColor =
                theme.palette.text.secondary;
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0px)';
            (e.currentTarget as HTMLElement).style.borderColor =
              selectedPlateId === plate.id
                ? theme.palette.primary.main
                : theme.palette.divider;
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: theme.palette.text.primary }}>
            {plate.name}
          </h3>
          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '11px',
              color: theme.palette.text.secondary,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={plate.gitUrl || plate.repositoryUrl || ''}
          >
            {plate.gitUrl || plate.repositoryUrl || 'No repository URL'}
          </p>
          {plate.description && (
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                color: theme.palette.text.secondary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {plate.description}
            </p>
          )}
          {plate.owner && (
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '11px',
                color: theme.palette.text.secondary,
              }}
            >
              <strong>Owner:</strong> {plate.owner}
            </p>
          )}
          {((plate.tags?.length ?? 0) > 0 || (plate.badges?.length ?? 0) > 0) && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(plate.tags?.length ?? 0) > 0 && (
                <div style={{ margin: 0, display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {plate.tags?.map(tag => (
                    <span
                      key={`tag-${tag}`}
                      style={{
                        fontSize: '10px',
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.primary.main,
                        padding: '3px 7px',
                        borderRadius: '999px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(plate.badges?.length ?? 0) > 0 && (
                <div style={{ margin: 0, display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {plate.badges?.map(badge => (
                    <span
                      key={`badge-${badge}`}
                      style={{
                        fontSize: '10px',
                        backgroundColor: theme.palette.success.light,
                        color: theme.palette.success.contrastText,
                        padding: '3px 7px',
                        borderRadius: '999px',
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
