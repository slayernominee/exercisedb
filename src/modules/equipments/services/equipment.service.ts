import { GetEquipmentsUseCase } from '../use-cases'

export class EquipmentService {
  private readonly getEquipmentUseCase: GetEquipmentsUseCase

  constructor() {
    this.getEquipmentUseCase = new GetEquipmentsUseCase()
  }

  getEquipments = () => {
    return this.getEquipmentUseCase.execute()
  }
}
