import { useState, useEffect } from 'react';
import { configApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useTheme } from '@material-ui/core/styles';
import {
  buildInitialFormData,
  fetchPlateMetadata,
} from './plateMetadata';
import {
  PlateGenerationTab,
  PlateInfoTab,
  PlateSchemaTab,
} from './PlateDetailTabs';
import { generateProject, isRequiredFormValid } from './generateProject';
import {
  FALLBACK_SCHEMA,
  PlateDetailProps,
  PlateMetadata,
  TabType,
} from './types';

const KIKPLATE_ICON_SRC = '/kikplate-icon.svg';

export const PlateDetail = ({ plate, onClose }: PlateDetailProps) => {
  const theme = useTheme();
  const fetchApi = useApi(fetchApiRef);
  const configApi = useApi(configApiRef);
  const backendBaseUrl =
    configApi.getOptionalString('backend.baseUrl') ?? window.location.origin;

  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState<PlateMetadata>({});
  const [isLoading, setIsLoading] = useState(false);

  const kikplateBaseUrl =
    configApi.getOptionalString('kikplate.baseUrl') ?? 'https://kikplate.dev';

  useEffect(() => {
    if (!plate?.gitUrl) {
      setMetadata({});
      setFormData({});
      return;
    }

    setIsLoading(true);
    fetchPlateMetadata(plate.gitUrl).then(data => {
      setMetadata(data);
      setFormData(buildInitialFormData(data));
      setIsLoading(false);
    });
  }, [plate?.gitUrl]);

  if (!plate) {
    return null;
  }

  const schema = metadata.schema || FALLBACK_SCHEMA;

  const handleFormChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const plateSlug = plate?.slug;
      if (!plateSlug) {
        throw new Error('Plate slug not available');
      }

      await generateProject({
        fetchApi,
        backendBaseUrl,
        plateSlug,
        formData,
        metadata,
      });
    } catch (error) {
      console.error('Error generating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate project:\n${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = isRequiredFormValid(formData, schema.fields);
  const openInKikplateUrl = `${kikplateBaseUrl.replace(
    /\/+$/,
    '',
  )}/plates/${encodeURIComponent(plate.slug)}`;

  return (
    <div
      style={{
        width: '100%',
        minWidth: '360px',
        borderLeft: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={KIKPLATE_ICON_SRC}
              alt="Kikplate"
              style={{ width: '18px', height: '18px', objectFit: 'contain' }}
            />
            <h2 style={{ margin: 0, fontSize: '17px', color: theme.palette.text.primary }}>
              {plate.name}
            </h2>
          </div>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '11px',
              color: theme.palette.text.secondary,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            }}
          >
            {plate.slug}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => window.open(openInKikplateUrl, '_blank', 'noopener,noreferrer')}
            style={{
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              height: '30px',
              padding: '0 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              color: theme.palette.text.primary,
              whiteSpace: 'nowrap',
            }}
          >
            Open in Kikplate
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '8px',
              width: '30px',
              height: '30px',
              fontSize: '16px',
              lineHeight: 1,
              cursor: 'pointer',
              color: theme.palette.text.secondary,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 10px',
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {(['info', 'schema', 'generation'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '9px 12px',
              border: `1px solid ${
                activeTab === tab ? theme.palette.primary.main : theme.palette.divider
              }`,
              borderRadius: '8px',
              backgroundColor:
                activeTab === tab
                  ? theme.palette.action.selected
                  : theme.palette.background.default,
              color:
                activeTab === tab
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              fontSize: '12px',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: '20px',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {isLoading && activeTab !== 'info' ? (
          <div
            style={{
              textAlign: 'center',
              color: theme.palette.text.secondary,
              padding: '24px',
            }}
          >
            Loading plate data...
          </div>
        ) : null}

        {activeTab === 'info' && <PlateInfoTab plate={plate} metadata={metadata} />}

        {activeTab === 'schema' && (
          <PlateSchemaTab metadata={metadata} schema={schema} />
        )}

        {activeTab === 'generation' && (
          <PlateGenerationTab
            schema={schema}
            metadata={metadata}
            formData={formData}
            isGenerating={isGenerating}
            isFormValid={isFormValid}
            onFormChange={handleFormChange}
            onSubmit={handleGenerate}
          />
        )}
      </div>
    </div>
  );
};

