# 📦 About @own3d/sdk

This is our core package for OWN3D Extension. It acts as a bridge between the extension and the OWN3D platform and
provides some helper functions to make the development of extensions easier.

## Install from the command line:

```bash
npm install @own3d/sdk
```

Sometimes you need to add the following line to your `.npmrc` file, to route package requests to the right registry:

```text
@own3d:registry=https://npm.pkg.github.com
```

## Example Usage

Here is a quick example on how to use the SDK:

```typescript
import { initializeExtension } from '@own3d/sdk/extension'
import { useAuth } from '@own3d/sdk/auth'

const extension = initializeExtension()

const {onAuthorized} = useAuth(extension)

onAuthorized(async (user) => {
    console.log(user)
})
```

## Documentation

Our full documentation can be found [here](https://dev.own3d.tv/docs/extensions/sdk.html).

## Publish to GitHub

1. Bump version in `package.json`
2. Run `npm run release`