interface ExtensionAndShortHeaderFields {
  authorIds: Array<string>;
  shortDescription: string;
  extensionNamespace: string;
  fullName: string;
  name: string;
  version: string;
  gdevelopVersion?: string;
  tags: Array<string>;
  category: string;
  previewIconUrl: string;
}

interface ExtensionAndHeaderFields {
  description: string;
  helpPath: string;
  iconUrl: string;
}

type ExtensionTier = 'community' | 'reviewed';

export interface ExtensionShortHeader extends ExtensionAndShortHeaderFields {
  tier: ExtensionTier;
  url: string;
  headerUrl: string;
  eventsBasedBehaviorsCount: number;
  eventsFunctionsCount: number;
}

export interface ExtensionHeader
  extends ExtensionShortHeader,
    ExtensionAndHeaderFields {}

export interface ExtensionsDatabase {
  version: string;
  allTags: Array<string>;
  allCategories: Array<string>;
  extensionShortHeaders: Array<ExtensionShortHeader>;
  views: {
    default: {
      firstExtensionIds: Array<string>;
    };
  };
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

export interface Parameter {
  codeOnly: boolean;
  defaultValue: string;
  description: string;
  longDescription: string;
  name: string;
  optional: boolean;
  supplementaryInformation: string;
  type: 'expression';
}

export interface EventsFunction {
  description: string;
  fullName: string;
  functionType:
    | 'StringExpression'
    | 'Expression'
    | 'Action'
    | 'Condition'
    | 'ExpressionAndCondition'
    | 'ActionWithOperator';
  name: string;
  getterName: string;
  private: boolean;
  sentence: string;
  events: any[];
  parameters: Parameter[];
  objectGroups: string[];
}

export interface EventsBasedBehaviors {
  description: string;
  fullName: string;
  name: string;
  objectType: string;
  eventsFunctions: EventsFunction[];
}

export interface EventsBasedObjects {
  description: string;
  fullName: string;
  name: string;
  defaultName: string;
  eventsFunctions: EventsFunction[];
}

export interface Extension
  extends ExtensionAndShortHeaderFields,
    ExtensionAndHeaderFields {
  tags: string | string[];
  eventsFunctions: EventsFunction[];
  eventsBasedBehaviors: EventsBasedBehaviors[];
  eventsBasedObjects?: EventsBasedObjects[];
}

export interface ExtensionWithProperFileInfo {
  state: 'success';
  filename: string;
  tier: ExtensionTier;
  extension: Extension;
}
interface ExtensionWithErroredFileInfo {
  state: 'error';
  filename: string;
  tier: ExtensionTier;
  error: Error;
}

export type ExtensionWithFileInfo =
  | ExtensionWithProperFileInfo
  | ExtensionWithErroredFileInfo;

export interface Error {
  message: `[${string}]: ${string}`;
  fix?: () => void;
}
