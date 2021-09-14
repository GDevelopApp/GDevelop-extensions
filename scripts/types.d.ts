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
