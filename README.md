# Odyssey Design

Odyssey Design provides React components, design tokens, themes, and documentation for the web.

## Development

Use Bun 1.4 and Node.js 26.

```sh
bun install --frozen-lockfile
bun run dev
bun run check
bun run test
bun run build
```

The component catalog runs at http://localhost:4174/. Package exports expose
primitives, higher-level patterns, themes, and the shared stylesheet in
`@odyssey/ui`. The `@odyssey/pro` package preserves legacy import paths.
The workspace also contains internationalization, AI UI, the docs runtime, the
component catalog, and the web test toolkit.

## Developing with Odyssey

When this checkout is an Odyssey Git submodule, install and run products from
the Odyssey root. Edit components in the submodule to test changes in a
product. Push component commits to this repository first, then commit the updated
submodule pointer in Odyssey. Use a standalone clone to verify this repository's
lockfile and build in isolation.

## License

[MIT](LICENSE).
