import { PlateItem } from '../PlateList';

export interface PlateDetailProps {
  plate: PlateItem | null;
  onClose: () => void;
}

export interface FormField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  default?: string | number | boolean;
  options?: string[];
}

export interface PlateMetadata {
  schema?: {
    fields: FormField[];
  };
  schemaYaml?: string;
  filesYaml?: string;
  modules?: Record<string, { enabled: boolean }>;
  readme?: string;
  structure?: string;
  raw?: string;
}

export type TabType = 'info' | 'schema' | 'generation';

export const FALLBACK_SCHEMA: { fields: FormField[] } = {
  fields: [
    {
      name: 'projectName',
      type: 'string',
      required: true,
      description: 'Name of your project',
    },
    {
      name: 'description',
      type: 'string',
      required: false,
      description: 'Project description',
    },
  ],
};
