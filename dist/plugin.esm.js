import { jsx } from 'react/jsx-runtime';
import { PageBlueprint, createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { rootRouteRef } from './routes.esm.js';

const kikplateNavIcon = /* @__PURE__ */ jsx(
  "img",
  {
    src: "/kikplate-icon.svg",
    alt: "Kikplate",
    style: { width: 24, height: 24, objectFit: "contain" }
  }
);
const page = PageBlueprint.make({
  params: {
    title: "Kikplate",
    icon: kikplateNavIcon,
    path: "/kikplate",
    routeRef: rootRouteRef,
    loader: () => import('./components/PlatesPage/index.esm.js').then((m) => /* @__PURE__ */ jsx(m.PlatesPage, {}))
  }
});
const kikplatePlugin = createFrontendPlugin({
  pluginId: "kikplate",
  extensions: [page],
  routes: {
    root: rootRouteRef
  }
});

export { kikplatePlugin, page };
//# sourceMappingURL=plugin.esm.js.map
