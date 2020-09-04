import { GetChannelDataResponse } from '@hoprnet/hopr-protos/node/channels_pb'

/**
 * following grpc's best practises,
 * we reserve state '0' to identify an unknown state
 * @param state
 * @returns the same state plus one
 */
export function toGrpcState(state: number): GetChannelDataResponse.AsObject['state'] {
  return (state + 1) as GetChannelDataResponse.AsObject['state']
}
