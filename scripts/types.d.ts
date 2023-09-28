interface ItemExtensionHeaderFields {
  authorIds: Array<string>;
  extensionNamespace: string;
  version: string;
  gdevelopVersion?: string;
  tags: Array<string>;
  category: string;
  previewIconUrl: string;
}

type ExtensionTier = 'community' | 'reviewed';

/**
 * An extension, behavior or object.
 */
export interface RegistryItem extends ItemExtensionHeaderFields {
  tier: ExtensionTier;
  url: string;
  headerUrl: string;
}

interface ExtensionAndShortHeaderFields extends ItemExtensionHeaderFields {
  shortDescription: string;
  fullName: string;
  name: string;
}

interface ExtensionAndHeaderFields {
  description: string;
  helpPath: string;
  iconUrl: string;
}

export interface ExtensionShortHeader
  extends RegistryItem,
    ExtensionAndShortHeaderFields {
  tier: ExtensionTier;
  url: string;
  headerUrl: string;
  eventsBasedBehaviorsCount: number;
  eventsFunctionsCount: number;
}

interface BehaviorAndShortHeaderFields {
  description: string;
  fullName: string;
  name: string;
  objectType: string;
}

export interface BehaviorShortHeader
  extends RegistryItem,
    BehaviorAndShortHeaderFields {
  extensionName: string;
  /**
   * All required behaviors including transitive ones.
   */
  allRequiredBehaviorTypes: Array<string>;
}

interface ObjectAndShortHeaderFields {
  description: string;
  fullName: string;
  name: string;
}

export interface ObjectShortHeader
  extends RegistryItem,
    ObjectAndShortHeaderFields {
  extensionName: string;
}

export interface ExtensionHeader
  extends ExtensionShortHeader,
    ExtensionAndHeaderFields {}

export interface ExtensionsDatabase {
  version: string;
  /** @deprecated Tags list should be built by the UI. When only reviewed
   * extensions are shown, some tags could lead to no extension. */
  allTags: Array<string>;
  /** @deprecated Categories list should be built by the UI. */
  allCategories: Array<string>;
  extensionShortHeaders: Array<ExtensionShortHeader>;
  behavior: {
    headers: Array<BehaviorShortHeader>;
    views: {
      default: {
        firstIds: Array<{ extensionName: string; behaviorName: string }>;
      };
    };
  };
  object: {
    headers: Array<ObjectShortHeader>;
    views: {
      default: {
        firstIds: Array<{ extensionName: string; objectName: string }>;
      };
    };
  };
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

export interface PropertyDescriptor {
  type: 'Number' | 'String' | 'Boolean' | 'Choice' | 'Color' | 'Behavior';
  extraInformation: string[];
}

export interface EventsBasedBehavior {
  description: string;
  fullName: string;
  name: string;
  objectType: string;
  private?: boolean;
  eventsFunctions: EventsFunction[];
  propertyDescriptors: PropertyDescriptor[];
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
  eventsBasedBehaviors: EventsBasedBehavior[];
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
