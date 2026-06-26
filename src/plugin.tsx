import {
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';

import { rootRouteRef } from './routes';

const kikplateNavIcon = (
  <img
    src="/kikplate-icon.svg"
    alt="Kikplate"
    style={{ width: 24, height: 24, objectFit: 'contain' }}
  />
);

export const page = PageBlueprint.make({
  params: {
    title: 'Kikplate',
    icon: kikplateNavIcon,
    path: '/kikplate',
    routeRef: rootRouteRef,
    loader: () =>
      import('./components/PlatesPage').then(m => (
        <m.PlatesPage />
      )),
  },
});

export const kikplatePlugin = createFrontendPlugin({
  pluginId: 'kikplate',
  extensions: [page],
  routes: {
    root: rootRouteRef,
  }
});
