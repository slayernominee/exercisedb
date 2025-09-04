import { IUseCase } from '#common/types/use-case.type.js'
import { FileLoader } from '../../../data/load'
import { FetchAllEquipmentRes } from '../types'

export class GetEquipmentsUseCase implements IUseCase<void, FetchAllEquipmentRes> {
  constructor() {}

  async execute(): Promise<FetchAllEquipmentRes> {
    const result = await FileLoader.loadEquipments()
    return result
  }
}
