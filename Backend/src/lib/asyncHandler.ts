import type { Request, Response, NextFunction, RequestHandler } from 'express';

// `any` here mirrors Express's own RequestHandler defaults — the wrapper must accept any handler
// shape and propagate generics to the consumer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AsyncHandler<P = any, ResBody = any, ReqBody = any, Query = any> = (
  req: Request<P, ResBody, ReqBody, Query>,
  res: Response<ResBody>,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <P = any, ResBody = any, ReqBody = any, Query = any>(
    fn: AsyncHandler<P, ResBody, ReqBody, Query>,
  ): RequestHandler<P, ResBody, ReqBody, Query> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
