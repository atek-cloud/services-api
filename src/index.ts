import { rpc, createRpcServer } from '@atek-cloud/node-rpc'

export const ID = 'atek.cloud/services-api'

export interface ServicesApi {
  // List all installed services.
  list (): Promise<{services: ServiceInfo[]}>

  // Fetch information about an installed service.
  get (id: string): Promise<ServiceInfo>

  // Install a new service.
  install (opts: InstallOpts): Promise<ServiceInfo>

  // Uninstall a service.
  uninstall (id: string): Promise<void>

  // Change the settings of a service.
  configure (id: string, opts: ConfigureOpts): Promise<void>

  // Start a service process.
  start (id: string): Promise<void>

  // Stop a service process.
  stop (id: string): Promise<void>

  // Restart a service process.
  restart (id: string): Promise<void>

  // Query the source package for software updates.
  checkForPackageUpdates (id: string): Promise<{hasUpdate: boolean, installedVersion: string, latestVersion: string}>

  // Update the service to the highest version which matches "desiredVersion".
  updatePackage (id: string): Promise<{installedVersion: string, oldVersion: string}>
}

export class ServiceRecord {
  id: string = ''
  port: number = 0
  sourceUrl: string = ''
  desiredVersion?: string
  package: {
    sourceType: SourceTypeEnum
    installedVersion?: string
    title?: string
  } = {sourceType: SourceTypeEnum.file}
  manifest?: {
    name?: string
    description?: string
    author?: string
    license?: string
  }
  installedBy: string = ''
  static schema = {
    "type": "object",
    "properties": {
      "id": {"type": "string"},
      "port": {"type": "number"},
      "sourceUrl": {"type": "string", "format": "uri"},
      "desiredVersion": {"type": "string"},
      "package": {
        "type": "object",
        "properties": {
          "sourceType": {"type": "string"},
          "installedVersion": {"type": "string"},
          "title": {"type": "string"}
        },
        "required": ["sourceType"]
      },
      "manifest": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "description": {"type": "string"},
          "author": {"type": "string"},
          "license": {"type": "string"}
        }
      },
      "installedBy": {"type": "string"}
    },
    "required": [
      "id",
      "port",
      "sourceUrl",
      "package",
      "installedBy"
    ]
  }
}

export class ServiceInfo {
  status: StatusEnum = StatusEnum.inactive
  settings: ServiceRecord = new ServiceRecord()
  static schema = {
    "type": "object",
    "properties": {
      "status": {"type": "string"},
      "settings": ServiceRecord.schema
    },
    "required": [
      "status",
      "settings"
    ]
  }
}

export enum StatusEnum {
  inactive = 'inactive',
  active = 'active'
}

export class InstallOpts {
  sourceUrl: string = ''
  id?: string
  desiredVersion?: string
  port?: number
  static schema = {
    "type": "object",
    "properties": {
      "sourceUrl": {
        "type": "string",
        "format": "uri"
      },
      "id": {"type": "string"},
      "desiredVersion": {"type": "string"},
      "port": {"type": "number"}
    },
    "required": ["sourceUrl"]
  }
}

export class ConfigureOpts {
  id?: string
  sourceUrl?: string
  desiredVersion?: string
  port?: number
  static schema = {
    "type": "object",
    "properties": {
      "id": {"type": "string"},
      "sourceUrl": {
        "type": "string",
        "format": "uri"
      },
      "desiredVersion": {"type": "string"},
      "port": {"type": "number"}
    }
  }
}

export enum SourceTypeEnum {
  file = 'file',
  git = 'git'
}

export function createClient () {
  return rpc<ServicesApi>(ID)
}

export function createServer (handlers: any) {
  return createRpcServer(handlers, {
    list: {
      response: {services: {type: 'array', items: ServiceInfo.schema}}
    },
    get: {
      params: [{type: 'string'}],
      response: ServiceInfo
    },
    install: {
      params: [InstallOpts],
      response: ServiceInfo
    },
    uninstall: {
      params: [{type: 'string'}]
    },
    configure: {
      params: [{type: 'string'}, ConfigureOpts]
    },
    start: {
      params: [{type: 'string'}]
    },
    stop: {
      params: [{type: 'string'}]
    },
    restart: {
      params: [{type: 'string'}]
    },
    checkForPackageUpdates: {
      params: [{type: 'string'}],
      response: {
        type: 'object',
        properties: {
          hasUpdate: {type: 'boolean'},
          installedVersion: {type: 'string'},
          latestVersion: {type: 'string'}
        }
      }
    },
    updatePackage: {
      params: [{type: 'string'}],
      response: {
        type: 'object',
        properties: {
          installedVersion: {type: 'string'},
          oldVersion: {type: 'string'}
        }
      }
    }
  })
}

export default createClient()