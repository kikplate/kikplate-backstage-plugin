import { jsxs, jsx } from 'react/jsx-runtime';
import { useTheme } from '@material-ui/core/styles';
import { formatDate } from './plateMetadata.esm.js';

const PlateInfoTab = ({ plate, metadata }) => {
  const theme = useTheme();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Name" }),
      /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "14px", fontWeight: 600 }, children: plate.name })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Slug" }),
      /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "13px", fontFamily: "monospace" }, children: plate.slug })
    ] }),
    plate.owner && /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Owner" }),
      /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "13px" }, children: plate.owner })
    ] }),
    plate.description && /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Description" }),
      /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "13px", lineHeight: 1.6, color: theme.palette.text.primary }, children: plate.description })
    ] }),
    (plate.tags?.length ?? 0) > 0 && /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Tags" }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap" }, children: plate.tags?.map((tag) => /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            fontSize: "11px",
            backgroundColor: theme.palette.action.hover,
            color: theme.palette.primary.main,
            padding: "4px 10px",
            borderRadius: "4px"
          },
          children: tag
        },
        tag
      )) })
    ] }),
    plate.updatedAt && /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Last Updated" }),
      /* @__PURE__ */ jsx("p", { style: { margin: 0, fontSize: "12px", color: theme.palette.text.secondary }, children: formatDate(plate.updatedAt) })
    ] }),
    plate.gitUrl && /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Repository" }),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: plate.gitUrl,
          target: "_blank",
          rel: "noopener noreferrer",
          style: {
            fontSize: "12px",
            color: theme.palette.primary.main,
            textDecoration: "none",
            wordBreak: "break-all"
          },
          children: plate.gitUrl
        }
      )
    ] }),
    metadata.structure ? /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 12px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Folder Structure" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            padding: "14px",
            fontSize: "11px",
            fontFamily: "monospace",
            color: theme.palette.text.primary,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          },
          children: metadata.structure
        }
      )
    ] }) : null,
    metadata.readme ? /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 12px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "README" }),
      /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "8px",
            padding: "14px",
            fontSize: "12px",
            color: theme.palette.text.primary,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          },
          children: metadata.readme
        }
      )
    ] }) : null
  ] });
};
const PlateSchemaTab = ({ metadata, schema }) => {
  const theme = useTheme();
  const fallbackSchemaYaml = `schema:
${schema.fields.map((field) => {
    const lines = [
      `  ${field.name}:`,
      `    type: ${field.type}`
    ];
    if (field.required !== void 0) {
      lines.push(`    required: ${field.required}`);
    }
    if (field.default !== void 0) {
      lines.push(`    default: ${String(field.default)}`);
    }
    if (field.description) {
      lines.push(`    description: ${field.description}`);
    }
    return lines.join("\n");
  }).join("\n")}`;
  const schemaBlock = metadata.schemaYaml ? `schema:
${metadata.schemaYaml}` : fallbackSchemaYaml;
  const filesBlock = metadata.filesYaml ? `files:
${metadata.filesYaml}` : "";
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 16px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Schema & Files" }),
    /* @__PURE__ */ jsx("div", { style: yamlBlockStyle(theme), children: /* @__PURE__ */ jsx("pre", { style: yamlPreStyle, children: schemaBlock }) }),
    filesBlock ? /* @__PURE__ */ jsx("div", { style: { ...yamlBlockStyle(theme), marginTop: "16px" }, children: /* @__PURE__ */ jsx("pre", { style: yamlPreStyle, children: filesBlock }) }) : null
  ] });
};
const PlateGenerationTab = ({
  schema,
  metadata,
  formData,
  isGenerating,
  isFormValid,
  onFormChange,
  onSubmit
}) => {
  const theme = useTheme();
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 20px 0", fontSize: "14px", color: theme.palette.text.secondary }, children: "Generate Project" }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: (e) => {
          e.preventDefault();
          onSubmit();
        },
        style: { display: "flex", flexDirection: "column", gap: "16px" },
        children: [
          schema.fields.map((field) => /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs(
              "label",
              {
                htmlFor: field.name,
                style: {
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: theme.palette.text.primary
                },
                children: [
                  field.name,
                  field.required && /* @__PURE__ */ jsx("span", { style: { color: theme.palette.error.main }, children: "*" })
                ]
              }
            ),
            field.description && /* @__PURE__ */ jsx("p", { style: { margin: "0 0 6px 0", fontSize: "11px", color: theme.palette.text.secondary }, children: field.description }),
            field.type === "boolean" ? /* @__PURE__ */ jsxs(
              "select",
              {
                id: field.name,
                value: formData[field.name] || (field.default !== void 0 ? String(field.default) : ""),
                onChange: (e) => onFormChange(field.name, e.target.value),
                required: field.required,
                style: inputStyle(theme, true),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "-- Select --" }),
                  /* @__PURE__ */ jsx("option", { value: "true", children: "true" }),
                  /* @__PURE__ */ jsx("option", { value: "false", children: "false" })
                ]
              }
            ) : field.options && field.options.length > 0 ? /* @__PURE__ */ jsxs(
              "select",
              {
                id: field.name,
                value: formData[field.name] || (field.default !== void 0 ? String(field.default) : ""),
                onChange: (e) => onFormChange(field.name, e.target.value),
                required: field.required,
                style: inputStyle(theme, true),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "-- Select --" }),
                  field.options.map((option) => /* @__PURE__ */ jsx("option", { value: option, children: option }, option))
                ]
              }
            ) : field.type === "number" || field.type === "integer" || field.type === "int" ? /* @__PURE__ */ jsx(
              "input",
              {
                id: field.name,
                type: "number",
                value: formData[field.name] || (field.default !== void 0 ? String(field.default) : ""),
                onChange: (e) => onFormChange(field.name, e.target.value),
                required: field.required,
                style: inputStyle(theme)
              }
            ) : field.type === "text" ? /* @__PURE__ */ jsx(
              "textarea",
              {
                id: field.name,
                value: formData[field.name] || (field.default !== void 0 ? String(field.default) : ""),
                onChange: (e) => onFormChange(field.name, e.target.value),
                required: field.required,
                style: {
                  ...inputStyle(theme),
                  minHeight: "80px",
                  resize: "vertical"
                }
              }
            ) : /* @__PURE__ */ jsx(
              "input",
              {
                id: field.name,
                type: "text",
                value: formData[field.name] || (field.default !== void 0 ? String(field.default) : ""),
                onChange: (e) => onFormChange(field.name, e.target.value),
                required: field.required,
                style: inputStyle(theme)
              }
            )
          ] }, field.name)),
          metadata.modules && Object.keys(metadata.modules).length > 0 && /* @__PURE__ */ jsxs(
            "div",
            {
              style: {
                borderTop: `1px solid ${theme.palette.divider}`,
                paddingTop: "16px",
                marginTop: "16px"
              },
              children: [
                /* @__PURE__ */ jsx("h4", { style: { margin: "0 0 12px 0", fontSize: "13px", color: theme.palette.text.secondary, fontWeight: 600 }, children: "Optional Modules" }),
                Object.entries(metadata.modules).map(([moduleName]) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px"
                    },
                    children: [
                      /* @__PURE__ */ jsx(
                        "input",
                        {
                          id: `module_${moduleName}`,
                          type: "checkbox",
                          checked: formData[`module_${moduleName}`] !== "false",
                          onChange: (e) => onFormChange(`module_${moduleName}`, e.target.checked ? "true" : "false"),
                          style: {
                            cursor: "pointer",
                            width: "16px",
                            height: "16px"
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        "label",
                        {
                          htmlFor: `module_${moduleName}`,
                          style: {
                            fontSize: "13px",
                            color: theme.palette.text.primary,
                            cursor: "pointer",
                            textTransform: "capitalize"
                          },
                          children: moduleName
                        }
                      )
                    ]
                  },
                  moduleName
                ))
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: !isFormValid || isGenerating,
              style: {
                marginTop: "12px",
                padding: "10px 16px",
                borderRadius: "4px",
                border: "none",
                backgroundColor: isFormValid ? theme.palette.primary.main : theme.palette.action.disabledBackground,
                color: isFormValid ? theme.palette.primary.contrastText : theme.palette.text.disabled,
                fontSize: "13px",
                fontWeight: 600,
                cursor: isFormValid ? "pointer" : "not-allowed",
                transition: "background-color 0.2s"
              },
              children: isGenerating ? "Generating..." : "Generate Project"
            }
          )
        ]
      }
    )
  ] });
};
const inputStyle = (theme, isSelect = false) => ({
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: `1px solid ${theme.palette.divider}`,
  fontSize: "13px",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  cursor: isSelect ? "pointer" : void 0
});
const yamlBlockStyle = (theme) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  padding: "18px"
});
const yamlPreStyle = {
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.8,
  fontSize: "12px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
};

export { PlateGenerationTab, PlateInfoTab, PlateSchemaTab };
//# sourceMappingURL=PlateDetailTabs.esm.js.map
