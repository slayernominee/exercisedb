import { GetBodyPartsUseCase } from '../use-cases'

export class BodyPartService {
  private readonly getBodyPartsUseCase: GetBodyPartsUseCase

  constructor() {
    this.getBodyPartsUseCase = new GetBodyPartsUseCase()
  }

  getBodyParts = () => {
    return this.getBodyPartsUseCase.execute()
  }
}
