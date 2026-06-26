import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { Progress } from '@backstage/core-components';
import { useApi, configApiRef, fetchApiRef } from '@backstage/frontend-plugin-api';
import { Header, Container } from '@backstage/ui';
import { useState, useEffect, useMemo } from 'react';
import useAsync from 'react-use/esm/useAsync';
import { useTheme } from '@material-ui/core/styles';
import { PlateList } from '../PlateList/PlateList.esm.js';
import { PlateDetail } from '../PlateDetail/PlateDetail.esm.js';
import { NotFound } from '../NotFound/NotFound.esm.js';

const DEFAULT_PLATES_ENDPOINT = "/api/proxy/kikplate-api/plates";
const DEFAULT_PAGE_SIZE = 20;
const asString = (value) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return void 0;
};
const asRecord = (value) => {
  if (value && typeof value === "object") {
    return value;
  }
  return void 0;
};
const toPlate = (input) => {
  if (!input || typeof input !== "object") {
    return void 0;
  }
  const row = input;
  const id = asString(row.id) ?? asString(row.slug) ?? asString(row.name);
  const name = asString(row.name) ?? asString(row.title) ?? id;
  const slug = asString(row.slug) ?? asString(row.name) ?? id;
  if (!id || !name || !slug) {
    return void 0;
  }
  const tags = Array.isArray(row.tags) ? row.tags.map((item) => {
    if (typeof item === "string") {
      return asString(item);
    }
    const tagRow = asRecord(item);
    if (!tagRow) {
      return void 0;
    }
    return asString(tagRow.tag) ?? asString(tagRow.name) ?? asString(tagRow.slug);
  }).filter((tag) => Boolean(tag)) : [];
  const badges = Array.isArray(row.badges) ? row.badges.map((item) => {
    if (typeof item === "string") {
      return asString(item);
    }
    const badgeRow = asRecord(item);
    if (!badgeRow) {
      return void 0;
    }
    const nestedBadge = asRecord(badgeRow.badge);
    return asString(badgeRow.name) ?? asString(badgeRow.slug) ?? asString(nestedBadge?.name) ?? asString(nestedBadge?.slug);
  }).filter((badge) => Boolean(badge)) : [];
  return {
    id,
    name,
    slug,
    owner: asString(row.owner) ?? asString(row.organization),
    description: asString(row.description) ?? asString(row.summary),
    tags,
    badges,
    updatedAt: asString(row.updatedAt) ?? asString(row.updated_at) ?? asString(row.createdAt) ?? asString(row.created_at),
    gitUrl: asString(row.repo_url) ?? asString(row.repository) ?? asString(row.repositoryUrl),
    repositoryUrl: asString(row.repo_url) ?? asString(row.repository_url)
  };
};
const toPlateList = (payload) => {
  const root = payload;
  const collection = Array.isArray(payload) ? payload : Array.isArray(root?.items) ? root.items : Array.isArray(root?.plates) ? root.plates : Array.isArray(root?.data) ? root.data : [];
  return collection.map(toPlate).filter((plate) => Boolean(plate));
};
const asNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return void 0;
};
const toPlatePage = (payload) => {
  const items = toPlateList(payload);
  const root = payload;
  const total = asNumber(root?.total) ?? items.length;
  return { items, total };
};
function usePlates(platesEndpoint, page, limit) {
  const { fetch } = useApi(fetchApiRef);
  return useAsync(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });
    const response = await fetch(`${platesEndpoint}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch plates: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return toPlatePage(data);
  }, [fetch, platesEndpoint, page, limit]);
}
const PlatesPage = () => {
  const theme = useTheme();
  const configApi = useApi(configApiRef);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedPlateId, setSelectedPlateId] = useState();
  const backendBaseUrl = configApi.getOptionalString("backend.baseUrl")?.replace(/\/+$/, "") ?? "";
  const platesEndpoint = `${backendBaseUrl}/api/proxy/kikplate-api/plates`;
  const { value: platePage, loading, error } = usePlates(
    backendBaseUrl ? platesEndpoint : DEFAULT_PLATES_ENDPOINT,
    page,
    pageSize
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
    return plates.filter((plate) => {
      const haystack = [
        plate.name,
        plate.slug,
        plate.owner,
        plate.description,
        plate.tags?.join(" "),
        plate.badges?.join(" ")
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [plates, search]);
  const selectedPlate = filteredPlates.find((p) => p.id === selectedPlateId) ?? null;
  if (loading) {
    return /* @__PURE__ */ jsx(Progress, {});
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Header, { title: "      cd /Users/moeidheidari/projects/backstage/kikplate/plugins/kikplatePlates" }),
    /* @__PURE__ */ jsxs(Container, { children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            marginBottom: "16px",
            gap: "12px",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "14px",
            padding: "14px",
            backgroundColor: theme.palette.background.paper
          },
          children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "12px", alignItems: "center" }, children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  "aria-label": "Search plates",
                  placeholder: "Search plates by name, slug, owner, tags...",
                  value: search,
                  onChange: (event) => setSearch(event.target.value),
                  style: {
                    flex: 1,
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontSize: "14px",
                    boxSizing: "border-box",
                    boxShadow: "none"
                  }
                }
              ),
              search.trim() ? /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setSearch("");
                  },
                  style: {
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                    fontSize: "12px",
                    cursor: "pointer"
                  },
                  children: "Clear"
                }
              ) : null
            ] }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  fontSize: "12px",
                  color: theme.palette.text.secondary,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap"
                },
                children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    "Showing ",
                    filteredPlates.length,
                    " of ",
                    plates.length,
                    " on page ",
                    page,
                    " ",
                    "(",
                    totalPlates,
                    " total)"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
                    /* @__PURE__ */ jsx("label", { htmlFor: "page-size", style: { fontSize: "12px" }, children: "Per page" }),
                    /* @__PURE__ */ jsx(
                      "select",
                      {
                        id: "page-size",
                        value: pageSize,
                        onChange: (event) => {
                          const nextSize = Number(event.target.value);
                          setPageSize(nextSize);
                          setPage(1);
                        },
                        style: {
                          padding: "6px 8px",
                          borderRadius: "8px",
                          border: `1px solid ${theme.palette.divider}`,
                          backgroundColor: theme.palette.background.default,
                          color: theme.palette.text.primary,
                          fontSize: "12px"
                        },
                        children: [12, 20, 24, 48].map((size) => /* @__PURE__ */ jsx("option", { value: size, children: size }, size))
                      }
                    )
                  ] }),
                  error ? /* @__PURE__ */ jsx(
                    "div",
                    {
                      role: "alert",
                      style: { color: theme.palette.error.main, marginTop: "8px" },
                      children: "Unable to load plates from the configured Kikplate API server."
                    }
                  ) : null
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            display: "grid",
            gridTemplateColumns: selectedPlate ? "minmax(0, 1fr) minmax(360px, 42%)" : "1fr",
            gap: "0",
            borderRadius: "14px",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "visible",
            backgroundColor: theme.palette.background.default,
            boxShadow: "none"
          },
          children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  backgroundColor: theme.palette.background.paper
                },
                children: filteredPlates.length > 0 ? /* @__PURE__ */ jsx(
                  PlateList,
                  {
                    plates: filteredPlates,
                    onSelectPlate: (plate) => setSelectedPlateId(plate.id),
                    selectedPlateId
                  }
                ) : /* @__PURE__ */ jsx(NotFound, { searchQuery: search.trim() || void 0 })
              }
            ),
            selectedPlate ? /* @__PURE__ */ jsx(
              PlateDetail,
              {
                plate: selectedPlate,
                onClose: () => setSelectedPlateId(void 0)
              }
            ) : null
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            marginTop: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap"
          },
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setPage((prev) => Math.max(1, prev - 1));
                  setSelectedPlateId(void 0);
                },
                disabled: page <= 1,
                style: {
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  color: page <= 1 ? theme.palette.text.disabled : theme.palette.text.primary,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  fontSize: "12px"
                },
                children: "Previous"
              }
            ),
            /* @__PURE__ */ jsxs(
              "span",
              {
                style: {
                  fontSize: "12px",
                  color: theme.palette.text.secondary,
                  minWidth: "120px",
                  textAlign: "center"
                },
                children: [
                  "Page ",
                  page,
                  " / ",
                  totalPages
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => {
                  setPage((prev) => Math.min(totalPages, prev + 1));
                  setSelectedPlateId(void 0);
                },
                disabled: page >= totalPages,
                style: {
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  color: page >= totalPages ? theme.palette.text.disabled : theme.palette.text.primary,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  fontSize: "12px"
                },
                children: "Next"
              }
            )
          ]
        }
      )
    ] })
  ] });
};

export { PlatesPage };
//# sourceMappingURL=PlatesPage.esm.js.map
