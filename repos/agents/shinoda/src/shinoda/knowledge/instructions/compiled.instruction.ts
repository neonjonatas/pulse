import { roleInstruction } from './role.instruction'
import { platformArchitectureInstruction } from './platform-architecture.instruction'
import { eventPipelineInstruction } from './event-pipeline.instruction'
import { eventInventoryInstruction } from './event-inventory.instruction'
import { dataSourcesInstruction } from './data-sources.instruction'
import { diagnosticGuidelinesInstruction } from './diagnostic-guidelines.instruction'
import { outputFormatInstruction } from './output-format.instruction'

export const compiledInstructions = [
  roleInstruction,
  platformArchitectureInstruction,
  eventPipelineInstruction,
  eventInventoryInstruction,
  dataSourcesInstruction,
  diagnosticGuidelinesInstruction,
  outputFormatInstruction
].join('\n')
