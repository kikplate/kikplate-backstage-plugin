import { PlateItem } from '../PlateList';
import { useTheme } from '@material-ui/core/styles';
import { formatDate } from './plateMetadata';
import { FormField, PlateMetadata } from './types';

interface InfoTabProps {
  plate: PlateItem;
  metadata: PlateMetadata;
}

interface SchemaTabProps {
  metadata: PlateMetadata;
  schema: { fields: FormField[] };
}

interface GenerationTabProps {
  schema: { fields: FormField[] };
  metadata: PlateMetadata;
  formData: Record<string, string>;
  isGenerating: boolean;
  isFormValid: boolean;
  onFormChange: (fieldName: string, value: string) => void;
  onSubmit: () => void;
}

export const PlateInfoTab = ({ plate, metadata }: InfoTabProps) => {
  const theme = useTheme();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Name</h3>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{plate.name}</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Slug</h3>
        <p style={{ margin: 0, fontSize: '13px', fontFamily: 'monospace' }}>{plate.slug}</p>
      </div>

      {plate.owner && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Owner</h3>
          <p style={{ margin: 0, fontSize: '13px' }}>{plate.owner}</p>
        </div>
      )}

      {plate.description && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Description</h3>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: theme.palette.text.primary }}>
            {plate.description}
          </p>
        </div>
      )}

      {plate.tags.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Tags</h3>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {plate.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '11px',
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.primary.main,
                  padding: '4px 10px',
                  borderRadius: '4px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {plate.updatedAt && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Last Updated</h3>
          <p style={{ margin: 0, fontSize: '12px', color: theme.palette.text.secondary }}>{formatDate(plate.updatedAt)}</p>
        </div>
      )}

      {plate.gitUrl && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Repository</h3>
          <a
            href={plate.gitUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              color: theme.palette.primary.main,
              textDecoration: 'none',
              wordBreak: 'break-all',
            }}
          >
            {plate.gitUrl}
          </a>
        </div>
      )}

      {metadata.structure ? (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Folder Structure</h3>
          <div
            style={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              padding: '14px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: theme.palette.text.primary,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {metadata.structure}
          </div>
        </div>
      ) : null}

      {metadata.readme ? (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.palette.text.secondary }}>README</h3>
          <div
            style={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              padding: '14px',
              fontSize: '12px',
              color: theme.palette.text.primary,
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {metadata.readme}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export const PlateSchemaTab = ({ metadata, schema }: SchemaTabProps) => {
  const theme = useTheme();

  const fallbackSchemaYaml = `schema:\n${schema.fields
    .map(field => {
      const lines = [
        `  ${field.name}:`,
        `    type: ${field.type}`,
      ];
      if (field.required !== undefined) {
        lines.push(`    required: ${field.required}`);
      }
      if (field.default !== undefined) {
        lines.push(`    default: ${String(field.default)}`);
      }
      if (field.description) {
        lines.push(`    description: ${field.description}`);
      }
      return lines.join('\n');
    })
    .join('\n')}`;

  const schemaBlock = metadata.schemaYaml
    ? `schema:\n${metadata.schemaYaml}`
    : fallbackSchemaYaml;
  const filesBlock = metadata.filesYaml ? `files:\n${metadata.filesYaml}` : '';

  return (
    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Schema & Files</h3>
      <div style={yamlBlockStyle(theme)}>
        <pre style={yamlPreStyle}>{schemaBlock}</pre>
      </div>
      {filesBlock ? (
        <div style={{ ...yamlBlockStyle(theme), marginTop: '16px' }}>
          <pre style={yamlPreStyle}>{filesBlock}</pre>
        </div>
      ) : null}
    </div>
  );
};

export const PlateGenerationTab = ({
  schema,
  metadata,
  formData,
  isGenerating,
  isFormValid,
  onFormChange,
  onSubmit,
}: GenerationTabProps) => {
  const theme = useTheme();

  return (
    <div>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '14px', color: theme.palette.text.secondary }}>Generate Project</h3>
      <form
        onSubmit={e => {
          e.preventDefault();
          onSubmit();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        {schema.fields.map(field => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: theme.palette.text.primary,
              }}
            >
              {field.name}
              {field.required && <span style={{ color: theme.palette.error.main }}>*</span>}
            </label>
            {field.description && (
              <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: theme.palette.text.secondary }}>{field.description}</p>
            )}
            {field.type === 'boolean' ? (
              <select
                id={field.name}
                value={formData[field.name] || (field.default !== undefined ? String(field.default) : '')}
                onChange={e => onFormChange(field.name, e.target.value)}
                required={field.required}
                style={inputStyle(theme, true)}
              >
                <option value="">-- Select --</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : field.options && field.options.length > 0 ? (
              <select
                id={field.name}
                value={formData[field.name] || (field.default !== undefined ? String(field.default) : '')}
                onChange={e => onFormChange(field.name, e.target.value)}
                required={field.required}
                style={inputStyle(theme, true)}
              >
                <option value="">-- Select --</option>
                {field.options.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'number' || field.type === 'integer' || field.type === 'int' ? (
              <input
                id={field.name}
                type="number"
                value={formData[field.name] || (field.default !== undefined ? String(field.default) : '')}
                onChange={e => onFormChange(field.name, e.target.value)}
                required={field.required}
                style={inputStyle(theme)}
              />
            ) : field.type === 'text' ? (
              <textarea
                id={field.name}
                value={formData[field.name] || (field.default !== undefined ? String(field.default) : '')}
                onChange={e => onFormChange(field.name, e.target.value)}
                required={field.required}
                style={{
                  ...inputStyle(theme),
                  minHeight: '80px',
                  resize: 'vertical',
                }}
              />
            ) : (
              <input
                id={field.name}
                type="text"
                value={formData[field.name] || (field.default !== undefined ? String(field.default) : '')}
                onChange={e => onFormChange(field.name, e.target.value)}
                required={field.required}
                style={inputStyle(theme)}
              />
            )}
          </div>
        ))}

        {metadata.modules && Object.keys(metadata.modules).length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${theme.palette.divider}`,
              paddingTop: '16px',
              marginTop: '16px',
            }}
          >
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: theme.palette.text.secondary, fontWeight: 600 }}>
              Optional Modules
            </h4>
            {Object.entries(metadata.modules).map(([moduleName]) => (
              <div
                key={moduleName}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <input
                  id={`module_${moduleName}`}
                  type="checkbox"
                  checked={formData[`module_${moduleName}`] !== 'false'}
                  onChange={e =>
                    onFormChange(`module_${moduleName}`, e.target.checked ? 'true' : 'false')
                  }
                  style={{
                    cursor: 'pointer',
                    width: '16px',
                    height: '16px',
                  }}
                />
                <label
                  htmlFor={`module_${moduleName}`}
                  style={{
                    fontSize: '13px',
                    color: theme.palette.text.primary,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {moduleName}
                </label>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={!isFormValid || isGenerating}
          style={{
            marginTop: '12px',
            padding: '10px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isFormValid ? theme.palette.primary.main : theme.palette.action.disabledBackground,
            color: isFormValid ? theme.palette.primary.contrastText : theme.palette.text.disabled,
            fontSize: '13px',
            fontWeight: 600,
            cursor: isFormValid ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s',
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate Project'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = (theme: any, isSelect = false) => ({
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.divider}`,
  fontSize: '13px',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  cursor: isSelect ? 'pointer' : undefined,
});

const yamlBlockStyle = (theme: any) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '10px',
  padding: '18px',
});

const yamlPreStyle = {
  margin: 0,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
  lineHeight: 1.8,
  fontSize: '12px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};
