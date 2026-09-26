# statinfer demo

The interactive demo site for [statinfer](https://www.npmjs.com/package/statinfer), live at https://statinfer.vercel.app/.

It's a [Next.js](https://nextjs.org) app that installs statinfer from npm, like any other user would. So the demo only shows **released** features.

## Running it locally

From the repository root:

```sh
pnpm -C demo install
pnpm -C demo dev
```

Then open http://localhost:3000.

## Checks

From the repository root, `pnpm demo:check` installs, lints and builds the demo. CI runs the same checks on every pull request.

## Deployment

Vercel deploys `main` to https://statinfer.vercel.app/, and builds a preview of every pull request. The Vercel project uses `demo` as its root directory, and sets `ENABLE_EXPERIMENTAL_COREPACK=1` so that it uses the pnpm version pinned in `package.json`.

## Trying unreleased library changes

To check how the demo works with library changes that haven't been released yet, temporarily install a locally built package. From the repository root:

```sh
pnpm build && pnpm pack
pnpm -C demo add ../statinfer-<version>.tgz
```

**Don't commit this.** When you're done, put the demo back on the published version:

```sh
git checkout demo/package.json demo/pnpm-lock.yaml
pnpm -C demo install
rm statinfer-*.tgz
```