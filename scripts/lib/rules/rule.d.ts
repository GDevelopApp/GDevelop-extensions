import { ExtensionWithFilename, EventsFunction } from '../../types';

export interface RuleContext extends ExtensionWithFilename {
  onError: (error: string) => void;
  publicEventsFunctions: EventsFunction[];
  allEventsFunctions: EventsFunction[];
}

export type Rule = (context: RuleContext) => Promise<void>;

export interface RuleModule {
  name: string;
  validate: Rule;
}
