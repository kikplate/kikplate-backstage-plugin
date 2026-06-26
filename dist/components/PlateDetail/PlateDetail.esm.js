import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { useApi, fetchApiRef, configApiRef } from '@backstage/core-plugin-api';
import { useTheme } from '@material-ui/core/styles';
import { fetchPlateMetadata, buildInitialFormData } from './plateMetadata.esm.js';
import { PlateInfoTab, PlateSchemaTab, PlateGenerationTab } from './PlateDetailTabs.esm.js';
import { isRequiredFormValid, generateProject } from './generateProject.esm.js';
import { FALLBACK_SCHEMA } from './types.esm.js';

const KIKPLATE_ICON_SRC = "/kikplate-icon.svg";
const PlateDetail = ({ plate, onClose }) => {
  const theme = useTheme();
  const fetchApi = useApi(fetchApiRef);
  const configApi = useApi(configApiRef);
  const backendBaseUrl = configApi.getOptionalString("backend.baseUrl") ?? window.location.origin;
  const [activeTab, setActiveTab] = useState("info");
  const [formData, setFormData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const kikplateBaseUrl = configApi.getOptionalString("kikplate.baseUrl") ?? "https://kikplate.dev";
  useEffect(() => {
    if (!plate?.gitUrl) {
      setMetadata({});
      setFormData({});
      return;
    }
    setIsLoading(true);
    fetchPlateMetadata(plate.gitUrl).then((data) => {
      setMetadata(data);
      setFormData(buildInitialFormData(data));
      setIsLoading(false);
    });
  }, [plate?.gitUrl]);
  if (!plate) {
    return null;
  }
  const schema = metadata.schema || FALLBACK_SCHEMA;
  const handleFormChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
    }));
  };
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const plateSlug = plate?.slug;
      if (!plateSlug) {
        throw new Error("Plate slug not available");
      }
      await generateProject({
        fetchApi,
        backendBaseUrl,
        plateSlug,
        formData,
        metadata
      });
    } catch (error) {
      console.error("Error generating project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to generate project:
${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };
  const isFormValid = isRequiredFormValid(formData, schema.fields);
  const openInKikplateUrl = `${kikplateBaseUrl.replace(
    /\/+$/,
    ""
  )}/plates/${encodeURIComponent(plate.slug)}`;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        width: "100%",
        minWidth: "360px",
        borderLeft: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default
      },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            },
            children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                  /* @__PURE__ */ jsx(
                    "img",
                    {
                      src: KIKPLATE_ICON_SRC,
                      alt: "Kikplate",
                      style: { width: "18px", height: "18px", objectFit: "contain" }
                    }
                  ),
                  /* @__PURE__ */ jsx("h2", { style: { margin: 0, fontSize: "17px", color: theme.palette.text.primary }, children: plate.name })
                ] }),
                /* @__PURE__ */ jsx(
                  "p",
                  {
                    style: {
                      margin: "4px 0 0 0",
                      fontSize: "11px",
                      color: theme.palette.text.secondary,
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                    },
                    children: plate.slug
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => window.open(openInKikplateUrl, "_blank", "noopener,noreferrer"),
                    style: {
                      backgroundColor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: "8px",
                      height: "30px",
                      padding: "0 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: theme.palette.text.primary,
                      whiteSpace: "nowrap"
                    },
                    children: "Open in Kikplate"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: onClose,
                    style: {
                      backgroundColor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: "8px",
                      width: "30px",
                      height: "30px",
                      fontSize: "16px",
                      lineHeight: 1,
                      cursor: "pointer",
                      color: theme.palette.text.secondary
                    },
                    children: "\u2715"
                  }
                )
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            style: {
              display: "flex",
              gap: "6px",
              padding: "8px 10px",
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            },
            children: ["info", "schema", "generation"].map((tab) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setActiveTab(tab),
                style: {
                  flex: 1,
                  padding: "9px 12px",
                  border: `1px solid ${activeTab === tab ? theme.palette.primary.main : theme.palette.divider}`,
                  borderRadius: "8px",
                  backgroundColor: activeTab === tab ? theme.palette.action.selected : theme.palette.background.default,
                  color: activeTab === tab ? theme.palette.primary.main : theme.palette.text.secondary,
                  fontSize: "12px",
                  fontWeight: activeTab === tab ? 600 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textTransform: "capitalize"
                },
                children: tab.charAt(0).toUpperCase() + tab.slice(1)
              },
              tab
            ))
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            style: {
              padding: "20px",
              backgroundColor: theme.palette.background.default
            },
            children: [
              isLoading && activeTab !== "info" ? /* @__PURE__ */ jsx(
                "div",
                {
                  style: {
                    textAlign: "center",
                    color: theme.palette.text.secondary,
                    padding: "24px"
                  },
                  children: "Loading plate data..."
                }
              ) : null,
              activeTab === "info" && /* @__PURE__ */ jsx(PlateInfoTab, { plate, metadata }),
              activeTab === "schema" && /* @__PURE__ */ jsx(PlateSchemaTab, { metadata, schema }),
              activeTab === "generation" && /* @__PURE__ */ jsx(
                PlateGenerationTab,
                {
                  schema,
                  metadata,
                  formData,
                  isGenerating,
                  isFormValid,
                  onFormChange: handleFormChange,
                  onSubmit: handleGenerate
                }
              )
            ]
          }
        )
      ]
    }
  );
};

export { PlateDetail };
//# sourceMappingURL=PlateDetail.esm.js.map
