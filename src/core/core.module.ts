import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ParserService } from './parser/parser.service'
import { CoreService } from './core.service'
import { hoprFactory } from './core.factory'

@Module({
  providers: [ConfigService, ParserService, CoreService, {
    provide: "hoprNode",
    useFactory: hoprFactory,
    inject: [ConfigService, ParserService]
  }],
  exports: [CoreService],
})
export class CoreModule implements OnModuleInit, OnModuleDestroy {
  constructor(private coreService: CoreService) {}

  async onModuleInit(): Promise<void> {
    await this.coreService.start()
  }

  async onModuleDestroy(): Promise<void> {
    await this.coreService.stop()
  }
}
