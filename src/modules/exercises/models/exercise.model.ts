import { z } from 'zod'
export const ExerciseModel = z.object({
  exerciseId: z.string(),
  name: z.string(),
  gifUrl: z.string(),
  targetMuscles: z.array(z.string()),
  bodyParts: z.array(z.string()),
  equipments: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  instructions: z.array(z.string())
})

// Common pagination schema
export const PaginationQuerySchema = z.object({
  offset: z.coerce.number().nonnegative().optional().openapi({
    title: 'Offset',
    description:
      'The number of exercises to skip from the start of the list. Useful for pagination to fetch subsequent pages of results.',
    type: 'number',
    example: 0,
    default: 0
  }),
  limit: z.coerce.number().positive().max(100).optional().openapi({
    title: 'Limit',
    description:
      'The maximum number of exercises to return in the response. Limits the number of results for pagination purposes.',
    maximum: 25,
    minimum: 1,
    type: 'number',
    example: 10,
    default: 10
  })
})

// Common response schema
export const ExerciseResponseSchema = z.object({
  success: z.literal(true).openapi({
    description: 'Indicates whether the request was successful',
    example: true
  }),
  metadata: z.object({
    totalExercises: z.number().openapi({
      description: 'Total number of exercises matching the criteria',
      example: 150
    }),
    totalPages: z.number().openapi({
      description: 'Total number of pages available',
      example: 15
    }),
    currentPage: z.number().openapi({
      description: 'Current page number',
      example: 1
    }),
    previousPage: z.string().nullable().openapi({
      description: 'URL for the previous page, null if on first page',
      example: '/api/exercises?offset=0&limit=10'
    }),
    nextPage: z.string().nullable().openapi({
      description: 'URL for the next page, null if on last page',
      example: '/api/exercises?offset=20&limit=10'
    })
  }),
  data: z.array(ExerciseModel).openapi({
    description: 'Array of exercises'
  })
})
