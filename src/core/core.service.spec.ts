import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { CoreService } from './core.service'
import { ParserService } from './parser/parser.service'
import { setNode } from '../main' 
import { resetNodeForTests } from './hoprnode'
import { hoprFactory, HoprFactory } from './core.factory'


export type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};

export const hoprNodeMockFactory: () => MockType<any> = jest.fn(() => ({
  start: jest.fn(entity => entity),
  stop: jest.fn(entity => entity),
}));

describe('CoreService', () => {
  let service: CoreService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, ParserService, CoreService, {
        provide: "hoprNode",
        useFactory: hoprNodeMockFactory,
        inject: [ConfigService, ParserService]
      }],
      exports: [CoreService]
    }).compile()

    service = module.get<CoreService>(CoreService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

})

describe('We should be able to inject our own HOPR node into this nest stuff',  () =>{
  it('should work',async () => {
    let mockNode: any = jest.fn()
    mockNode.stop = jest.fn()

    setNode(mockNode)

    // Run all the nest boilerplate stuff.
    const testmod: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, ParserService, CoreService, {
        provide: "hoprNode",
        useFactory: hoprNodeMockFactory,
        inject: [ConfigService, ParserService]
      }],
    }).compile()
    let service = testmod.get<CoreService>(CoreService)

    service.start()
    service.stop()

    expect(mockNode.stop).toHaveBeenCalled()
    resetNodeForTests()
  })
})
