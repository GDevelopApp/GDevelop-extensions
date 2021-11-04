import { ExtensionWithFilename, EventsFunction } from '../../types';

export type Rule = (context: RuleContext) => Promise<void>;
export type ErrorLogger = (error: string, fix?: () => void) => void;

export interface RuleContext extends ExtensionWithFilename {
  onError: ErrorLogger;
  publicEventsFunctions: EventsFunction[];
  allEventsFunctions: EventsFunction[];
}

export interface RuleModule {
  name: string;
  validate: Rule;
}
