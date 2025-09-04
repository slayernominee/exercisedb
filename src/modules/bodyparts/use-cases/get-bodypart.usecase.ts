import { IUseCase } from '#common/types/use-case.type.js'
import { FileLoader } from '../../../data/load'
import { FetchAllBodyPartRes } from '../types'

export class GetBodyPartsUseCase implements IUseCase<void, FetchAllBodyPartRes> {
  constructor() {}

  async execute(): Promise<FetchAllBodyPartRes> {
    const result = await FileLoader.loadBodyParts()
    return result
  }
}
