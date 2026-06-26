import { jsx, jsxs } from 'react/jsx-runtime';
import { useTheme } from '@material-ui/core/styles';

const PlateList = ({
  plates,
  onSelectPlate,
  selectedPlateId
}) => {
  const theme = useTheme();
  const hoverShadowColor = theme.palette.type === "dark" ? "rgba(0, 0, 0, 0.35)" : "rgba(0, 0, 0, 0.12)";
  return /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "18px",
        padding: "20px",
        alignContent: "start"
      },
      children: plates.map((plate) => /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: () => onSelectPlate?.(plate),
          style: {
            padding: "16px",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: "12px",
            cursor: "pointer",
            backgroundColor: selectedPlateId === plate.id ? theme.palette.action.hover : theme.palette.background.paper,
            borderColor: selectedPlateId === plate.id ? theme.palette.primary.main : theme.palette.divider,
            boxShadow: "none",
            transform: "translateY(0px)",
            transition: "all 0.2s ease"
          },
          onMouseEnter: (e) => {
            if (selectedPlateId !== plate.id) {
              e.currentTarget.style.boxShadow = `0 10px 20px ${hoverShadowColor}`;
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = theme.palette.text.secondary;
            }
          },
          onMouseLeave: (e) => {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.borderColor = selectedPlateId === plate.id ? theme.palette.primary.main : theme.palette.divider;
          },
          children: [
            /* @__PURE__ */ jsx("h3", { style: { margin: "0 0 8px 0", fontSize: "16px", color: theme.palette.text.primary }, children: plate.name }),
            /* @__PURE__ */ jsx(
              "p",
              {
                style: {
                  margin: "0 0 10px 0",
                  fontSize: "11px",
                  color: theme.palette.text.secondary,
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                },
                title: plate.gitUrl || plate.repositoryUrl || "",
                children: plate.gitUrl || plate.repositoryUrl || "No repository URL"
              }
            ),
            plate.description && /* @__PURE__ */ jsx(
              "p",
              {
                style: {
                  margin: "0 0 8px 0",
                  fontSize: "12px",
                  color: theme.palette.text.secondary,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical"
                },
                children: plate.description
              }
            ),
            plate.owner && /* @__PURE__ */ jsxs(
              "p",
              {
                style: {
                  margin: "0 0 8px 0",
                  fontSize: "11px",
                  color: theme.palette.text.secondary
                },
                children: [
                  /* @__PURE__ */ jsx("strong", { children: "Owner:" }),
                  " ",
                  plate.owner
                ]
              }
            ),
            ((plate.tags?.length ?? 0) > 0 || (plate.badges?.length ?? 0) > 0) && /* @__PURE__ */ jsxs("div", { style: { marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }, children: [
              (plate.tags?.length ?? 0) > 0 && /* @__PURE__ */ jsx("div", { style: { margin: 0, display: "flex", gap: "4px", flexWrap: "wrap" }, children: plate.tags?.map((tag) => /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    fontSize: "10px",
                    backgroundColor: theme.palette.action.hover,
                    color: theme.palette.primary.main,
                    padding: "3px 7px",
                    borderRadius: "999px"
                  },
                  children: tag
                },
                `tag-${tag}`
              )) }),
              (plate.badges?.length ?? 0) > 0 && /* @__PURE__ */ jsx("div", { style: { margin: 0, display: "flex", gap: "4px", flexWrap: "wrap" }, children: plate.badges?.map((badge) => /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    fontSize: "10px",
                    backgroundColor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                    padding: "3px 7px",
                    borderRadius: "999px"
                  },
                  children: badge
                },
                `badge-${badge}`
              )) })
            ] })
          ]
        },
        plate.id
      ))
    }
  );
};

export { PlateList };
//# sourceMappingURL=PlateList.esm.js.map
