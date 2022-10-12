# parcel-resolver-typescript-esm
**Parcel v2 plugin** for [TypeScript ESM imports](https://www.typescriptlang.org/docs/handbook/esm-node.html).

## Why
Current behavior of Parcel v2 is that you need to import files using _.ts_ and _.tsx_ extensions inside an ESM file which is against TypeScript default behavior. You can read more about the issue [here](https://github.com/parcel-bundler/parcel/issues/7823#issuecomment-1272194789).

So this plugin is adding new behavior which is aligned with TypeScript itself. Yay! 🎉  

## Installation
```
npm install parcel-resolver-typescript-esm -D
yarn add parcel-resolver-typescript-esm -D
```

## Configuration
Inside _.parcelrc_ file, add:

```json
"resolvers": [
  "parcel-resolver-typescript-esm",
  "..."
]
```

**Three dots' placement is important!**

## Contribution
Contribution should be very easy, not a headache at all. Just to make sure that you read the contents of the **.vscode/settings.json file** (even if you do not use VsCode as an editor) to see basic guidelines for files. After your contribution is done, run the **build command** and test it before creating a PR.
