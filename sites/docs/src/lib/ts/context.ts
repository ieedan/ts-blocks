import type { Agent } from 'package-manager-detector';
import { persistedContext } from './persisted-context-provider';
import { context } from '$lib/utils/context-provider';

export const pmContext = persistedContext<Agent>('package-manager', { persistValue: true });

export const commandContext = context<boolean>('command-open');