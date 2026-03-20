import type { ConsumeMiddleware, PublishMiddleware } from './types'

/**
 * Runs publish middleware chain around a final action.
 */
export async function composePublishMiddleware(
  context: Parameters<PublishMiddleware>[0],
  middlewares: PublishMiddleware[],
  finalAction: () => Promise<void>
): Promise<void> {
  let index = -1
  const dispatch = async (nextIndex: number): Promise<void> => {
    if (nextIndex <= index) {
      throw new Error('Middleware next() called multiple times')
    }
    index = nextIndex

    const middleware = middlewares[nextIndex]
    if (!middleware) {
      await finalAction()
      return
    }

    await middleware(context, () => dispatch(nextIndex + 1))
  }

  await dispatch(0)
}

/**
 * Runs consume middleware chain around a final action.
 */
export async function composeConsumeMiddleware(
  context: Parameters<ConsumeMiddleware>[0],
  middlewares: ConsumeMiddleware[],
  finalAction: () => Promise<void>
): Promise<void> {
  let index = -1
  const dispatch = async (nextIndex: number): Promise<void> => {
    if (nextIndex <= index) {
      throw new Error('Middleware next() called multiple times')
    }
    index = nextIndex

    const middleware = middlewares[nextIndex]
    if (!middleware) {
      await finalAction()
      return
    }

    await middleware(context, () => dispatch(nextIndex + 1))
  }

  await dispatch(0)
}
