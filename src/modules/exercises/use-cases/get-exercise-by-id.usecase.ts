import { IUseCase } from '#common/types/use-case.type.js'
import { FileLoader } from '../../../data/load'
import { FetchExerciseByIdReq, Exercise as FetchExerciseByIdRes } from '../types'
import { HTTPException } from 'hono/http-exception'

export class GetExerciseByIdUseCase implements IUseCase<FetchExerciseByIdReq, FetchExerciseByIdRes> {
  constructor() {}

  async execute(request: FetchExerciseByIdReq): Promise<FetchExerciseByIdRes> {
    const { exerciseId } = request
    const exerciseData = await FileLoader.loadExercises()
    const isExerciseExist = exerciseData.find((exer) => exer.exerciseId === exerciseId)
    // check is exercise exist
    if (!isExerciseExist) {
      throw new HTTPException(404, {
        message: `exercise ${exerciseId} not found. `
      })
    }

    return { ...isExerciseExist }
  }
}
