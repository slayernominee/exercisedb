import { GetMusclesUseCase } from '../use-cases'

export class MuscleService {
  private readonly getMuscleUseCase: GetMusclesUseCase

  constructor() {
    this.getMuscleUseCase = new GetMusclesUseCase()
  }

  getMuscles = () => {
    return this.getMuscleUseCase.execute()
  }
}
