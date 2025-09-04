import { IUseCase } from '#common/types/use-case.type.js'
import { FileLoader } from '../../../data/load'
import { Muscle as FetchAllMuscleRes } from '../types'

export class GetMusclesUseCase implements IUseCase<void, FetchAllMuscleRes[]> {
  constructor() {}

  async execute(): Promise<FetchAllMuscleRes[]> {
    const result = await FileLoader.loadMuscles()
    return result
  }
}
