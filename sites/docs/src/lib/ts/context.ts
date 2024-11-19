import type { Agent } from 'package-manager-detector';
import { context } from './context-provider';

export const pmContext = context<Agent>('package-manager');
