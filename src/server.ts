import { BodyPartController, EquipmentController, ExerciseController, MuscleController } from './modules'
import { App } from './app'

const app = new App([
  new ExerciseController(),
  new MuscleController(),
  new EquipmentController(),
  new BodyPartController()
]).getApp()

export default {
  fetch: app.fetch,
  port: 80
}
