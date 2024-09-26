# 📦 About @own3d/sdk

This is our core package for OWN3D Extension. It acts as a bridge between the extension and the OWN3D platform and
provides some helper functions to make the development of extensions easier.

## Install from the command line:

Our package will be released on [JSR](https://jsr.io/). You can install it using the following command:

```bash
# deno
deno add jsr:@own3d/sdk

# npm (use any of npx, yarn dlx, pnpm dlx, or bunx)
npx jsr add @own3d/sdk
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
