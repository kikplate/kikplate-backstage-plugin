import { FormField, PlateMetadata } from './types';

export const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

const getRawGitUrl = (gitUrl?: string): string | null => {
  if (!gitUrl) return null;

  if (gitUrl.includes('github.com')) {
    return (
      gitUrl
        .replace(/\.git$/, '')
        .replace('github.com', 'raw.githubusercontent.com')
        .replace(/\/tree\//, '/') + '/main'
    );
  }

  if (gitUrl.includes('gitlab.com')) {
    return gitUrl.replace(/\.git$/, '') + '/-/raw/main';
  }

  return null;
};

const parseSchemaYaml = (yamlContent: string): FormField[] => {
  const fields: FormField[] = [];
  const lines = yamlContent.split('\n');

  let currentFieldName = '';
  let currentFieldType = 'string';
  let currentFieldDescription = '';
  let currentFieldDefault: string | number | boolean | undefined;
  let currentFieldRequired = false;
  let currentFieldOptions: string[] = [];
  let baseIndentation = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const indentation = line.search(/\S/);

    if (baseIndentation === -1 && trimmed && !trimmed.startsWith('schema:')) {
      baseIndentation = indentation;
    }

    if (
      indentation === baseIndentation &&
      trimmed.includes(':') &&
      !trimmed.startsWith('type:') &&
      !trimmed.startsWith('description:') &&
      !trimmed.startsWith('default:') &&
      !trimmed.startsWith('required:') &&
      !trimmed.startsWith('options:')
    ) {
      if (currentFieldName) {
        const field: FormField = {
          name: currentFieldName,
          type: currentFieldType,
        };
        if (currentFieldDescription) field.description = currentFieldDescription;
        if (currentFieldDefault !== undefined) field.default = currentFieldDefault;
        if (currentFieldRequired) field.required = currentFieldRequired;
        if (currentFieldOptions.length > 0) field.options = currentFieldOptions;
        fields.push(field);
      }

      const fieldMatch = trimmed.match(/^([^:]+):/);
      if (fieldMatch) {
        currentFieldName = fieldMatch[1];
        currentFieldType = 'string';
        currentFieldDescription = '';
        currentFieldDefault = undefined;
        currentFieldRequired = false;
        currentFieldOptions = [];
      }
    } else if (trimmed.startsWith('type:') && indentation > baseIndentation) {
      const typeMatch = trimmed.match(/type:\s*(.+)/);
      if (typeMatch) {
        currentFieldType = typeMatch[1].trim();
      }
    } else if (
      trimmed.startsWith('description:') &&
      indentation > baseIndentation
    ) {
      const descMatch = trimmed.match(/description:\s*(.+)/);
      if (descMatch) {
        currentFieldDescription = descMatch[1]
          .trim()
          .replace(/^['"]|['"]$/g, '');
      }
    } else if (trimmed.startsWith('default:') && indentation > baseIndentation) {
      const defaultMatch = trimmed.match(/default:\s*(.+)/);
      if (defaultMatch) {
        const defaultStr = defaultMatch[1].trim().replace(/^['"]|['"]$/g, '');
        if (
          currentFieldType === 'boolean' ||
          defaultStr === 'true' ||
          defaultStr === 'false'
        ) {
          currentFieldDefault = defaultStr === 'true';
        } else if (
          currentFieldType === 'int' ||
          currentFieldType === 'integer' ||
          currentFieldType === 'number'
        ) {
          currentFieldDefault = parseInt(defaultStr, 10);
        } else {
          currentFieldDefault = defaultStr;
        }
      }
    } else if (
      trimmed.startsWith('required:') &&
      indentation > baseIndentation
    ) {
      const reqMatch = trimmed.match(/required:\s*(.+)/);
      if (reqMatch) {
        currentFieldRequired = reqMatch[1].trim() === 'true';
      }
    } else if (trimmed.startsWith('options:') && indentation > baseIndentation) {
      for (let j = i + 1; j < lines.length; j++) {
        const optLine = lines[j];
        const optTrimmed = optLine.trim();
        const optIndentation = optLine.search(/\S/);

        if (optIndentation <= indentation) break;
        if (!optTrimmed || optTrimmed.startsWith('#')) continue;

        if (optTrimmed.startsWith('-')) {
          const option = optTrimmed
            .substring(1)
            .trim()
            .replace(/^['"]|['"]$/g, '');
          currentFieldOptions.push(option);
        }
      }
    }
  }

  if (currentFieldName) {
    const field: FormField = {
      name: currentFieldName,
      type: currentFieldType,
    };
    if (currentFieldDescription) field.description = currentFieldDescription;
    if (currentFieldDefault !== undefined) field.default = currentFieldDefault;
    if (currentFieldRequired) field.required = currentFieldRequired;
    if (currentFieldOptions.length > 0) field.options = currentFieldOptions;
    fields.push(field);
  }

  return fields;
};

export const buildInitialFormData = (metadata: PlateMetadata) => {
  const defaults: Record<string, string> = {};

  if (metadata.schema?.fields) {
    metadata.schema.fields.forEach(field => {
      if (field.default !== undefined) {
        defaults[field.name] = String(field.default);
      }
    });
  }

  if (metadata.modules) {
    Object.entries(metadata.modules).forEach(([moduleName, moduleConfig]) => {
      defaults[`module_${moduleName}`] = moduleConfig.enabled ? 'true' : 'false';
    });
  }

  return defaults;
};

export const fetchPlateMetadata = async (gitUrl: string): Promise<PlateMetadata> => {
  try {
    const rawUrl = getRawGitUrl(gitUrl);
    if (!rawUrl) {
      return {};
    }

    const response = await fetch(`${rawUrl}/plate.yaml`);

    if (!response.ok) {
      console.warn(`Failed to fetch plate.yaml: ${response.status}`);
      return {};
    }

    const yamlContent = await response.text();
    const metadata: PlateMetadata = { raw: yamlContent };

    const lines = yamlContent.split('\n');
    let currentSection = '';
    let schemaYaml = '';
    let filesYaml = '';
    let readmeContent = '';
    let structure = '';
    let modulesYaml = '';
    let inSchema = false;
    let inFiles = false;
    let inModules = false;
    let schemaIndentation = 0;
    let filesIndentation = 0;
    let modulesIndentation = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('schema:')) {
        currentSection = 'schema';
        inSchema = true;
        inFiles = false;
        inModules = false;
        schemaIndentation = line.search(/\S/);
        schemaYaml = trimmed.substring(7).trim();
        if (!schemaYaml) schemaYaml = '';
        continue;
      } else if (trimmed.startsWith('files:')) {
        currentSection = 'files';
        inSchema = false;
        inFiles = true;
        inModules = false;
        filesIndentation = line.search(/\S/);
        filesYaml = trimmed.substring(6).trim();
        if (!filesYaml) filesYaml = '';
        continue;
      } else if (trimmed.startsWith('modules:')) {
        currentSection = 'modules';
        inSchema = false;
        inFiles = false;
        inModules = true;
        modulesIndentation = line.search(/\S/);
        modulesYaml = trimmed.substring(8).trim();
        if (!modulesYaml) modulesYaml = '';
        continue;
      } else if (trimmed.startsWith('readme:')) {
        inSchema = false;
        inFiles = false;
        inModules = false;
        currentSection = 'readme';
        readmeContent = trimmed.substring(7).trim();
        continue;
      } else if (trimmed.startsWith('structure:')) {
        inSchema = false;
        inFiles = false;
        inModules = false;
        currentSection = 'structure';
        readmeContent = '';
        structure = trimmed.substring(10).trim();
        continue;
      } else if (trimmed && trimmed[0] !== '#' && !trimmed.startsWith('---')) {
        if (line[0] !== ' ' && line[0] !== '\t' && !trimmed.startsWith('-')) {
          if (inSchema) inSchema = false;
          if (inFiles) inFiles = false;
          if (inModules) inModules = false;
          currentSection = '';
        }
      }

      if (inSchema && trimmed && !trimmed.startsWith('schema:')) {
        const lineIndentation = line.search(/\S/);
        if (lineIndentation > schemaIndentation || !trimmed) {
          schemaYaml += '\n' + line;
        } else if (
          trimmed &&
          lineIndentation <= schemaIndentation &&
          !trimmed.startsWith('#')
        ) {
          inSchema = false;
        }
      } else if (inModules && trimmed && !trimmed.startsWith('modules:')) {
        const lineIndentation = line.search(/\S/);
        if (lineIndentation > modulesIndentation || !trimmed) {
          modulesYaml += '\n' + line;
        } else if (
          trimmed &&
          lineIndentation <= modulesIndentation &&
          !trimmed.startsWith('#')
        ) {
          inModules = false;
        }
      } else if (inFiles && trimmed && !trimmed.startsWith('files:')) {
        const lineIndentation = line.search(/\S/);
        if (lineIndentation > filesIndentation || !trimmed) {
          filesYaml += '\n' + line;
        } else if (
          trimmed &&
          lineIndentation <= filesIndentation &&
          !trimmed.startsWith('#')
        ) {
          inFiles = false;
        }
      } else if (
        currentSection === 'readme' &&
        trimmed &&
        !trimmed.startsWith('structure:') &&
        !trimmed.startsWith('schema:') &&
        !trimmed.startsWith('files:') &&
        !trimmed.startsWith('modules:')
      ) {
        readmeContent += '\n' + trimmed;
      } else if (
        currentSection === 'structure' &&
        trimmed &&
        !trimmed.startsWith('readme:') &&
        !trimmed.startsWith('schema:') &&
        !trimmed.startsWith('files:') &&
        !trimmed.startsWith('modules:')
      ) {
        structure += '\n' + trimmed;
      }
    }

    const schemaFields = schemaYaml.trim() ? parseSchemaYaml(schemaYaml) : [];
    if (schemaFields.length > 0) {
      metadata.schema = { fields: schemaFields };
    }
    if (schemaYaml.trim()) {
      metadata.schemaYaml = schemaYaml.trim();
    }
    if (filesYaml.trim()) {
      metadata.filesYaml = filesYaml.trim();
    }

    if (modulesYaml.trim()) {
      const modulesObj: Record<string, { enabled: boolean }> = {};
      const moduleLines = modulesYaml.split('\n');
      let currentModuleName = '';

      for (const modLine of moduleLines) {
        const modTrimmed = modLine.trim();
        if (!modTrimmed || modTrimmed.startsWith('#')) continue;

        const moduleMatch = modTrimmed.match(/^([^:]+):/);
        if (moduleMatch && modLine.search(/\S/) === modulesIndentation) {
          currentModuleName = moduleMatch[1];
          modulesObj[currentModuleName] = { enabled: false };
        } else if (modTrimmed.startsWith('enabled:') && currentModuleName) {
          const enabledMatch = modTrimmed.match(/enabled:\s*(.+)/);
          if (enabledMatch) {
            modulesObj[currentModuleName].enabled =
              enabledMatch[1].trim() === 'true';
          }
        }
      }

      if (Object.keys(modulesObj).length > 0) {
        metadata.modules = modulesObj;
      }
    }

    if (readmeContent.trim()) metadata.readme = readmeContent.trim();
    if (structure.trim()) metadata.structure = structure.trim();

    return metadata;
  } catch (error) {
    console.error('Error fetching plate metadata:', error);
    return {};
  }
};
