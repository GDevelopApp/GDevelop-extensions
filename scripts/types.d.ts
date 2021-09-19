export interface ExtensionShortHeader {
  authorIds: Array<string>;
  shortDescription: string;
  extensionNamespace: string;
  fullName: string;
  name: string;
  version: string;
  gdevelopVersion?: string;
  url: string;
  headerUrl: string;
  tags: Array<string>;
  previewIconUrl: string;
  eventsBasedBehaviorsCount: number;
  eventsFunctionsCount: number;
}

export interface ExtensionHeader extends ExtensionShortHeader {
  description: string;
  helpPath: string;
  iconUrl: string;
}

export interface ExtensionsDatabase {
  version: string;
  allTags: Array<string>;
  extensionShortHeaders: Array<ExtensionShortHeader>;
}

/**
 * A list of properties, either from the game engine public API (https://docs.gdevelop-app.com/GDJS%20Runtime%20Documentation/index.html),
 * or custom properties, that can be used by an extension.
 */
export interface ExtensionAllowedProperties {
  gdjsAllowedProperties: Array<string>;
  gdjsEvtToolsAllowedProperties: Array<string>;
  runtimeSceneAllowedProperties: Array<string>;
  javaScriptObjectAllowedProperties: Array<string>;
}

export interface DisallowedPropertyError {
  objectName: string;
  disallowedProperty: string;
  allowedProperties: string[];
}
