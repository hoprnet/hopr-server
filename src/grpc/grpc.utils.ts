import type { GrpcController } from './grpc.controller'
import { RpcException } from '@nestjs/microservices'
import { status as STATUS } from 'grpc'

/**
 * A decorator that catches errors and converts them to a grpc 'RpcException'.
 * It always returns 'RpcException' accompanied by the appropriate grpc status,
 * else it will default to 'INTERNAL'.
 */
export function toRpcException() {
  return (
    _target: GrpcController,
    _key: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>,
  ): typeof descriptor => {
    const originalFn = descriptor.value

    descriptor.value = async function (...args: any[]) {
      try {
        const result = await originalFn.bind(this)(...args)
        return result
      } catch (err) {
        // if (err instanceof RpcException) {
        //   throw err
        // } else {
        // }

        throw new RpcException({
          code: STATUS.INTERNAL,
          message: err,
        })
      }
    }

    return descriptor
  }
}
