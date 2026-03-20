/**
 * Abstraction for transactional work that can be begun, committed, or rolled back.
 *
 * @example
 * class DbUnitOfWork extends UnitOfWork {
 *   async begin() { await this.client.query('BEGIN') }
 *   async commit() { await this.client.query('COMMIT') }
 *   async rollback() { await this.client.query('ROLLBACK') }
 * }
 */
export abstract class UnitOfWork {
  /**
   * Begins a transaction.
   *
   * @returns Promise that resolves when the transaction has started
   */
  abstract begin(): Promise<void>

  /**
   * Commits the current transaction.
   *
   * @returns Promise that resolves when the transaction has been committed
   */
  abstract commit(): Promise<void>

  /**
   * Rolls back the current transaction.
   *
   * @returns Promise that resolves when the transaction has been rolled back
   */
  abstract rollback(): Promise<void>

  /**
   * Runs a function inside a transaction (begin -> fn -> commit, or rollback on error).
   *
   * @param fn - Async function to run inside the transaction
   * @returns The result of fn
   * @example
   * const order = await uow.withTransaction(() => orderRepo.save(order))
   */
  async withTransaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.begin()
    try {
      const result = await fn()
      await this.commit()
      return result
    } catch (error) {
      await this.rollback()
      throw error
    }
  }
}
