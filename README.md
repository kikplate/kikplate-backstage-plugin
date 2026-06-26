# kikplate

Welcome to the kikplate plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the app in this repository, meaning you'll be able
to access it by running `yarn start` in the root directory, and then navigating
to [/kikplate](http://localhost:3000/kikplate).

This plugin is built with Backstage's [frontend
system](https://backstage.io/docs/frontend-system/architecture/index), and you
can find more information about building plugins in the [plugin builder
documentation](https://backstage.io/docs/frontend-system/building-plugins/index).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Configure Kikplate API Server

This plugin reads plates through a Backstage proxy endpoint.

Set this in your `app-config.yaml` (or `app-config.production.yaml`):

```yaml
proxy:
	endpoints:
		'/kikplate-api':
			target: ${KIKPLATE_API_BASE_URL:-https://kikplate.dev/api}
			changeOrigin: true
```

When deploying, users can point the plugin to any compatible Kikplate API server by setting `KIKPLATE_API_BASE_URL`.
