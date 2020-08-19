import { default as dotenvParseVariables } from 'dotenv-parse-variables'
import type { HoprOptions } from '@hoprnet/hopr-core'
import Hopr from '@hoprnet/hopr-core'
import { StartOptions } from './core.service'
import { getBootstrapAddresses } from '@hoprnet/hopr-utils'
import { ConfigService } from '@nestjs/config'
import { ParserService } from './parser/parser.service'
import HoprCoreConnector from '@hoprnet/hopr-core-connector-interface'

export type HoprFactory = (ConfigService, ParserService) => Promise<Hopr<HoprCoreConnector>>

export const hoprFactory = async (configService: ConfigService, parserService: ParserService) => {
  const envOptions = dotenvParseVariables({
    debug: configService.get('DEBUG'),
    id: configService.get('ID'),
    bootstrapNode: configService.get('BOOTSTRAP_NODE'),
    host: configService.get('CORE_HOST'),
    bootstrapServers: configService.get('BOOTSTRAP_SERVERS'),
    provider: configService.get('PROVIDER'),
  }) as StartOptions

  // if only one server is provided, parser will parse it into a string
  if (typeof envOptions.bootstrapServers === 'string') {
    envOptions.bootstrapServers = [envOptions.bootstrapServers]
  }

  let bootstrapServers
  // At the moment, if it's run as a bootstrap node, we shouldn't add
  // boostrap nodes.
  if (!envOptions.bootstrapNode){
    console.log(":: Starting a server ::", envOptions)
    const bootstrapServerMap = await getBootstrapAddresses(envOptions.bootstrapServers ? envOptions.bootstrapServers.join(','): undefined)
    bootstrapServers = [... bootstrapServerMap.values()]
  } else {
    bootstrapServers = []
  }

  const options = {
    id: envOptions.id,
    debug: envOptions.debug ?? false,
    bootstrapNode: envOptions.bootstrapNode ?? false,
    network: 'ethereum',
    // using testnet bootstrap servers
    bootstrapServers: bootstrapServers,
    provider: envOptions.provider ?? 'wss://kovan.infura.io/ws/v3/f7240372c1b442a6885ce9bb825ebc36',
    host: envOptions.host ?? '0.0.0.0:9091',
    password: 'switzerland',
  }

  console.log(':: HOPR Options ::', options)
  console.log(':: Starting HOPR Core Node ::')
  return new Promise<Hopr<HoprCoreConnector>>(async (res, rej) => {
    try {
      res(Hopr.create({
        id: options.id,
        debug: options.debug,
        bootstrapNode: options.bootstrapNode,
        network: options.network,
        bootstrapServers: options.bootstrapServers,
        provider: options.provider,
        hosts: (await parserService.parseHost(options.host)) as HoprOptions['hosts'],
        password: options.password,
        // @TODO: deprecate this, refactor hopr-core to not expect an output function
        output: parserService.outputFunctor(),
      }))
      console.log(':: HOPR Core Node Started ::')
    } catch (err) {
      console.error(':: HOPR Core Node Failed to Start ::')
    }
  })
}