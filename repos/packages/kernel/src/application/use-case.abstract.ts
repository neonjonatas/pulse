/**
 * Base class for application use cases (single-responsibility operations).
 *
 * @param Input - Type of the use case input
 * @param Output - Type of the use case output
 * @example
 * class CreateOrderUseCase extends UseCase<CreateOrderInput, Order> {
 *   async execute(input: CreateOrderInput) {
 *     const order = Order.create(input)
 *     await this.orderRepo.save(order)
 *     return order
 *   }
 * }
 */
export abstract class UseCase<Input, Output> {
  /**
   * Executes the use case with the given input.
   *
   * @param input - Use case input
   * @returns Promise resolving to the use case output
   */
  abstract execute(input: Input): Promise<Output>
}
