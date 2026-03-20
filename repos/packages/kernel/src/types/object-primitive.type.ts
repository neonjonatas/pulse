/**
 * Plain-object constraint for domain event payloads.
 * `Domain` is a phantom type for coupling at compile time only.
 */
export type ObjectPrimitive<Domain = unknown> = Record<string, unknown> & {
  readonly __domain__?: Domain
}
