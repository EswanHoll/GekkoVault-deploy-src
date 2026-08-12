/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuditRouteImport } from './routes/audit'
import { Route as CatalogRouteImport } from './routes/catalog'
import { Route as LoginRouteImport } from './routes/login'
import { Route as StandardRouteImport } from './routes/standard'
import { Route as ToolsRouteImport } from './routes/tools'
import { Route as VaultRouteImport } from './routes/vault'
import { Route as ApiAuthSplatRouteImport } from './routes/api/auth/$'
import { Route as ApiV1SecretsCheckRouteImport } from './routes/api/v1/secrets/check'
import { Route as ApiV1SecretsFetchRouteImport } from './routes/api/v1/secrets/fetch'
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuditRoute = AuditRouteImport.update({
  id: '/audit',
  path: '/audit',
  getParentRoute: () => rootRouteImport,
} as any)
const CatalogRoute = CatalogRouteImport.update({
  id: '/catalog',
  path: '/catalog',
  getParentRoute: () => rootRouteImport,
} as any)
const LoginRoute = LoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRouteImport,
} as any)
const StandardRoute = StandardRouteImport.update({
  id: '/standard',
  path: '/standard',
  getParentRoute: () => rootRouteImport,
} as any)
const ToolsRoute = ToolsRouteImport.update({
  id: '/tools',
  path: '/tools',
  getParentRoute: () => rootRouteImport,
} as any)
const VaultRoute = VaultRouteImport.update({
  id: '/vault',
  path: '/vault',
  getParentRoute: () => rootRouteImport,
} as any)
const ApiAuthSplatRoute = ApiAuthSplatRouteImport.update({
  id: '/api/auth/$',
  path: '/api/auth/$',
  getParentRoute: () => rootRouteImport,
} as any)
const ApiV1SecretsCheckRoute = ApiV1SecretsCheckRouteImport.update({
  id: '/api/v1/secrets/check',
  path: '/api/v1/secrets/check',
  getParentRoute: () => rootRouteImport,
} as any)
const ApiV1SecretsFetchRoute = ApiV1SecretsFetchRouteImport.update({
  id: '/api/v1/secrets/fetch',
  path: '/api/v1/secrets/fetch',
  getParentRoute: () => rootRouteImport,
} as any)
export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/audit': typeof AuditRoute
  '/catalog': typeof CatalogRoute
  '/login': typeof LoginRoute
  '/standard': typeof StandardRoute
  '/tools': typeof ToolsRoute
  '/vault': typeof VaultRoute
  '/api/auth/$': typeof ApiAuthSplatRoute
  '/api/v1/secrets/check': typeof ApiV1SecretsCheckRoute
  '/api/v1/secrets/fetch': typeof ApiV1SecretsFetchRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/audit': typeof AuditRoute
  '/catalog': typeof CatalogRoute
  '/login': typeof LoginRoute
  '/standard': typeof StandardRoute
  '/tools': typeof ToolsRoute
  '/vault': typeof VaultRoute
  '/api/auth/$': typeof ApiAuthSplatRoute
  '/api/v1/secrets/check': typeof ApiV1SecretsCheckRoute
  '/api/v1/secrets/fetch': typeof ApiV1SecretsFetchRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/audit': typeof AuditRoute
  '/catalog': typeof CatalogRoute
  '/login': typeof LoginRoute
  '/standard': typeof StandardRoute
  '/tools': typeof ToolsRoute
  '/vault': typeof VaultRoute
  '/api/auth/$': typeof ApiAuthSplatRoute
  '/api/v1/secrets/check': typeof ApiV1SecretsCheckRoute
  '/api/v1/secrets/fetch': typeof ApiV1SecretsFetchRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/audit'
    | '/catalog'
    | '/login'
    | '/standard'
    | '/tools'
    | '/vault'
    | '/api/auth/$'
    | '/api/v1/secrets/check'
    | '/api/v1/secrets/fetch'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/audit'
    | '/catalog'
    | '/login'
    | '/standard'
    | '/tools'
    | '/vault'
    | '/api/auth/$'
    | '/api/v1/secrets/check'
    | '/api/v1/secrets/fetch'
  id:
    | '__root__'
    | '/'
    | '/audit'
    | '/catalog'
    | '/login'
    | '/standard'
    | '/tools'
    | '/vault'
    | '/api/auth/$'
    | '/api/v1/secrets/check'
    | '/api/v1/secrets/fetch'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuditRoute: typeof AuditRoute
  CatalogRoute: typeof CatalogRoute
  LoginRoute: typeof LoginRoute
  StandardRoute: typeof StandardRoute
  ToolsRoute: typeof ToolsRoute
  VaultRoute: typeof VaultRoute
  ApiAuthSplatRoute: typeof ApiAuthSplatRoute
  ApiV1SecretsCheckRoute: typeof ApiV1SecretsCheckRoute
  ApiV1SecretsFetchRoute: typeof ApiV1SecretsFetchRoute
}
declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/audit': {
      id: '/audit'
      path: '/audit'
      fullPath: '/audit'
      preLoaderRoute: typeof AuditRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/catalog': {
      id: '/catalog'
      path: '/catalog'
      fullPath: '/catalog'
      preLoaderRoute: typeof CatalogRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/standard': {
      id: '/standard'
      path: '/standard'
      fullPath: '/standard'
      preLoaderRoute: typeof StandardRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/tools': {
      id: '/tools'
      path: '/tools'
      fullPath: '/tools'
      preLoaderRoute: typeof ToolsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/vault': {
      id: '/vault'
      path: '/vault'
      fullPath: '/vault'
      preLoaderRoute: typeof VaultRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/api/auth/$': {
      id: '/api/auth/$'
      path: '/api/auth/$'
      fullPath: '/api/auth/$'
      preLoaderRoute: typeof ApiAuthSplatRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/api/v1/secrets/check': {
      id: '/api/v1/secrets/check'
      path: '/api/v1/secrets/check'
      fullPath: '/api/v1/secrets/check'
      preLoaderRoute: typeof ApiV1SecretsCheckRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/api/v1/secrets/fetch': {
      id: '/api/v1/secrets/fetch'
      path: '/api/v1/secrets/fetch'
      fullPath: '/api/v1/secrets/fetch'
      preLoaderRoute: typeof ApiV1SecretsFetchRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}
const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuditRoute: AuditRoute,
  CatalogRoute: CatalogRoute,
  LoginRoute: LoginRoute,
  StandardRoute: StandardRoute,
  ToolsRoute: ToolsRoute,
  VaultRoute: VaultRoute,
  ApiAuthSplatRoute: ApiAuthSplatRoute,
  ApiV1SecretsCheckRoute: ApiV1SecretsCheckRoute,
  ApiV1SecretsFetchRoute: ApiV1SecretsFetchRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
