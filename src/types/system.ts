export interface PhaseMilestone {
  id: number;
  version: string;
  name: string;
  status: 'active' | 'ready_for_input' | 'upcoming' | 'completed';
  description: string;
  keyPillars: string[];
}

export interface SystemState {
  currentVersion: string;
  activePhase: number;
  totalPhases: number;
  nonDestructiveMode: boolean;
  preservedModulesCount: number;
  lastUpdated: string;
}
