import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import { Subject, Observable } from 'rxjs'
import { GrpcService } from './grpc.service'
import { toRpcException } from './grpc.utils'
import { StatusResponse } from '@hoprnet/hopr-protos/node/status_pb'
import { VersionResponse } from '@hoprnet/hopr-protos/node/version_pb'
import { ShutdownResponse } from '@hoprnet/hopr-protos/node/shutdown_pb'
import { PingRequest, PingResponse } from '@hoprnet/hopr-protos/node/ping_pb'
import { GetNativeAddressResponse, GetHoprAddressResponse } from '@hoprnet/hopr-protos/node/address_pb'
import { GetNativeBalanceResponse, GetHoprBalanceResponse } from '@hoprnet/hopr-protos/node/balance_pb'
import {
  GetChannelsResponse,
  GetChannelDataRequest,
  GetChannelDataResponse,
  OpenChannelRequest,
  OpenChannelResponse,
  CloseChannelResponse,
  CloseChannelRequest,
} from '@hoprnet/hopr-protos/node/channels_pb'
import { SendRequest, SendResponse } from '@hoprnet/hopr-protos/node/send_pb'
import { ListenRequest, ListenResponse } from '@hoprnet/hopr-protos/node/listen_pb'

// @TODO: capture errors and turn them into GRPC errors
@Controller('grpc')
export class GrpcController {
  constructor(private grpcService: GrpcService) {}

  @GrpcMethod('Status')
  @toRpcException()
  async getStatus(): Promise<StatusResponse.AsObject> {
    return this.grpcService.getStatus()
  }

  @GrpcMethod('Version')
  @toRpcException()
  async getVersion(): Promise<VersionResponse.AsObject> {
    return this.grpcService.getVersion()
  }

  @GrpcMethod('Shutdown')
  @toRpcException()
  async shutdown(): Promise<ShutdownResponse.AsObject> {
    return this.grpcService.shutdown()
  }

  @GrpcMethod('Ping')
  @toRpcException()
  async getPing(req: PingRequest.AsObject): Promise<PingResponse.AsObject> {
    return this.grpcService.getPing(req)
  }

  @GrpcMethod('Balance')
  @toRpcException()
  async getNativeBalance(): Promise<GetNativeBalanceResponse.AsObject> {
    return this.grpcService.getNativeBalance()
  }

  @GrpcMethod('Balance')
  @toRpcException()
  async getHoprBalance(): Promise<GetHoprBalanceResponse.AsObject> {
    return this.grpcService.getHoprBalance()
  }

  @GrpcMethod('Address')
  @toRpcException()
  async getNativeAddress(): Promise<GetNativeAddressResponse.AsObject> {
    return this.grpcService.getNativeAddress()
  }

  @GrpcMethod('Address')
  @toRpcException()
  async getHoprAddress(): Promise<GetHoprAddressResponse.AsObject> {
    return this.grpcService.getHoprAddress()
  }

  @GrpcMethod('Channels')
  @toRpcException()
  async getChannels(): Promise<GetChannelsResponse.AsObject> {
    return this.grpcService.getChannels()
  }

  @GrpcMethod('Channels')
  @toRpcException()
  async getChannelData(req: GetChannelDataRequest.AsObject): Promise<GetChannelDataResponse.AsObject> {
    return this.grpcService.getChannelData(req)
  }

  @GrpcMethod('Channels')
  @toRpcException()
  async openChannel(req: OpenChannelRequest.AsObject): Promise<OpenChannelResponse.AsObject> {
    return this.grpcService.openChannel(req)
  }

  @GrpcMethod('Channels')
  @toRpcException()
  async closeChannel(req: CloseChannelRequest.AsObject): Promise<CloseChannelResponse.AsObject> {
    return this.grpcService.closeChannel(req)
  }

  @GrpcMethod('Send')
  @toRpcException()
  async send(req: SendRequest.AsObject): Promise<SendResponse.AsObject> {
    return this.grpcService.send(req)
  }

  // here we need to use 'GrpcMethod' see: https://github.com/nestjs/nest/issues/2659#issuecomment-516164027
  @GrpcMethod('Listen')
  @toRpcException()
  async listen(req: ListenRequest.AsObject): Promise<Observable<ListenResponse.AsObject>> {
    const events = await this.grpcService.listen(req)
    const subject = new Subject<ListenResponse.AsObject>()

    events.on('message', (message) => {
      subject.next({
        payload: message,
      })
    })

    return subject.asObservable()
  }
}
