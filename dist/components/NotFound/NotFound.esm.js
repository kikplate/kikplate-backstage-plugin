import { jsxs, jsx } from 'react/jsx-runtime';

const NotFound = ({ searchQuery }) => {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "48px 24px",
        textAlign: "center"
      },
      children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: "64px", marginBottom: "16px" }, children: "\u2205" }),
        /* @__PURE__ */ jsx("h2", { style: { margin: "0 0 8px 0", fontSize: "20px" }, children: searchQuery ? "No plates found" : "No plates available" }),
        searchQuery ? /* @__PURE__ */ jsxs("p", { style: { margin: "0", color: "#666", fontSize: "14px" }, children: [
          'Try adjusting your search for "',
          /* @__PURE__ */ jsx("strong", { children: searchQuery }),
          '"'
        ] }) : /* @__PURE__ */ jsx("p", { style: { margin: "0", color: "#666", fontSize: "14px" }, children: "No plates are currently available from the Kikplate API." })
      ]
    }
  );
};

export { NotFound };
//# sourceMappingURL=NotFound.esm.js.map
