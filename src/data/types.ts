export interface Equipment {
  name: string
}

export interface Exercise {
  /**
   * The id of the exercise
   * @example "trmte8s"
   */
  exerciseId: string

  /**
   * The name of the exercise.
   * @example "band shrug"
   */
  name: string

  /**
   * The gifUrl of the exercise.
   * @example "https://v1.cdn.exercisedb.dev/media/trmte8s.gif"
   */
  gifUrl: string

  /**
   * List of equipment required for the exercise.
   * @example ["band"]
   */
  equipments: string[]

  /**
   * Primary body parts targeted by the exercise.
   * @example ["back"]
   */
  bodyParts: string[]

  /**
   * Primary muscles targeted by the exercise.
   * @example ["traps"]
   */
  targetMuscles: string[]

  /**
   * Secondary muscles engaged during the exercise.
   * @example ["traps", "traps", "triceps"]
   */
  secondaryMuscles: string[]

  /**
   * Step-by-step instructions to perform the exercise.
   * @example ["Step:1 Stand with your feet shoulder-width apart and place the band under your feet, holding the ends with your hands..."]
   */
  instructions: string[]
}

export interface BodyPart {
  name: string
}

export interface Muscle {
  name: string
}
