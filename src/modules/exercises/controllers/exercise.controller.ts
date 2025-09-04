import { Routes } from '#common/types/route.type.js'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { z } from 'zod'
import { ExerciseService } from '../services/exercise.service'
import { ExerciseModel, ExerciseResponseSchema, PaginationQuerySchema } from '../models/exercise.model'

export class ExerciseController implements Routes {
  public controller: OpenAPIHono
  private readonly exerciseService: ExerciseService
  constructor() {
    this.controller = new OpenAPIHono()
    this.exerciseService = new ExerciseService()
  }
  private buildPaginationUrls(
    origin: string,
    pathname: string,
    currentPage: number,
    totalPages: number,
    limit: number,
    additionalParams: string = ''
  ) {
    const baseUrl = `${origin}${pathname}`
    const params = additionalParams ? `&${additionalParams}` : ''

    return {
      previousPage: currentPage > 1 ? `${baseUrl}?offset=${(currentPage - 2) * limit}&limit=${limit}${params}` : null,
      nextPage: currentPage < totalPages ? `${baseUrl}?offset=${currentPage * limit}&limit=${limit}${params}` : null
    }
  }

  public initRoutes() {
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/exercises/search',
        tags: ['EXERCISES'],
        summary: 'Search exercises with fuzzy matching',
        description:
          "Search exercises using fuzzy matching across all fields (name, muscles, equipment, body parts). Perfect for when users don't know exact terms.",
        operationId: 'searchExercises',
        request: {
          query: PaginationQuerySchema.extend({
            q: z.string().min(1).openapi({
              title: 'Search Query',
              description:
                'Search term that will be fuzzy matched against exercise names, muscles, equipment, and body parts',
              type: 'string',
              example: 'chest push',
              default: ''
            }),
            threshold: z.coerce.number().min(0).max(1).optional().openapi({
              title: 'Search Threshold',
              description: 'Fuzzy search threshold (0 = exact match, 1 = very loose match)',
              type: 'number',
              example: 0.3,
              default: 0.3
            })
          })
        },
        responses: {
          200: {
            description: 'Successful response with fuzzy search results',
            content: {
              'application/json': {
                schema: ExerciseResponseSchema
              }
            }
          },
          500: {
            description: 'Internal server error'
          }
        }
      }),
      async (ctx) => {
        const { offset = 0, limit = 10, q, threshold = 0.3 } = ctx.req.valid('query')
        const { origin, pathname } = new URL(ctx.req.url)

        const { totalExercises, currentPage, totalPages, exercises } = await this.exerciseService.searchExercises({
          offset,
          limit,
          query: q,
          threshold
        })

        const { previousPage, nextPage } = this.buildPaginationUrls(
          origin,
          pathname,
          currentPage,
          totalPages,
          limit,
          `q=${encodeURIComponent(q)}&threshold=${threshold}`
        )

        return ctx.json({
          success: true,
          metadata: {
            totalPages,
            totalExercises,
            currentPage,
            previousPage,
            nextPage
          },
          data: [...exercises]
        })
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/exercises',
        tags: ['EXERCISES'],
        summary: 'Get all exercises with optional search',
        description: 'Retrieve all exercises with optional fuzzy search filtering',
        operationId: 'getExercises',
        request: {
          query: PaginationQuerySchema.extend({
            search: z.string().optional().openapi({
              title: 'Search Query',
              description: 'Optional search term for fuzzy matching across all exercise fields',
              type: 'string',
              example: 'cardio',
              default: ''
            }),
            sortBy: z.enum(['name', 'exerciseId', 'targetMuscles', 'bodyParts', 'equipments']).optional().openapi({
              title: 'Sort Field',
              description: 'Field to sort exercises by',
              example: 'targetMuscles',
              default: 'targetMuscles'
            }),
            sortOrder: z.enum(['asc', 'desc']).optional().openapi({
              title: 'Sort Order',
              description: 'Sort order (ascending or descending)',
              example: 'desc',
              default: 'desc'
            })
          })
        },
        responses: {
          200: {
            description: 'Successful response with exercises',
            content: {
              'application/json': {
                schema: ExerciseResponseSchema
              }
            }
          },
          500: {
            description: 'Internal server error'
          }
        }
      }),
      async (ctx) => {
        const { offset = 0, limit = 10, search, sortBy = 'targetMuscles', sortOrder = 'desc' } = ctx.req.valid('query')
        const { origin, pathname } = new URL(ctx.req.url)

        const { totalExercises, totalPages, currentPage, exercises } = await this.exerciseService.getAllExercises({
          offset,
          limit,
          search,
          sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
        })

        const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
        const sortParams = `&sortBy=${sortBy}&sortOrder=${sortOrder}`
        const { previousPage, nextPage } = this.buildPaginationUrls(
          origin,
          pathname,
          currentPage,
          totalPages,
          limit,
          `${searchParam}${sortParams}`
        )

        return ctx.json({
          success: true,
          metadata: {
            totalPages,
            totalExercises,
            currentPage,
            previousPage,
            nextPage
          },
          data: [...exercises]
        })
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/exercises/filter',
        tags: ['EXERCISES'],
        summary: 'Advanced exercise filtering',
        description: 'Advance Filter exercises by multiple criteria with fuzzy search support',
        operationId: 'filterExercises',
        request: {
          query: PaginationQuerySchema.extend({
            search: z.string().optional().openapi({
              title: 'Search Query',
              description: 'Fuzzy search across all fields',
              type: 'string',
              example: 'chest workout'
            }),
            muscles: z.string().optional().openapi({
              title: 'Target Muscles',
              description: 'Comma-separated list of target muscles',
              type: 'string',
              example: 'chest,triceps'
            }),
            equipment: z.string().optional().openapi({
              title: 'Equipment',
              description: 'Comma-separated list of equipment',
              type: 'string',
              example: 'dumbbell,barbell'
            }),
            bodyParts: z.string().optional().openapi({
              title: 'Body Parts',
              description: 'Comma-separated list of body parts',
              type: 'string',
              example: 'upper arms,chest'
            }),
            sortBy: z.enum(['name', 'exerciseId', 'targetMuscles', 'bodyParts', 'equipments']).optional().openapi({
              title: 'Sort Field',
              description: 'Field to sort by',
              example: 'name',
              default: 'name'
            }),
            sortOrder: z.enum(['asc', 'desc']).optional().openapi({
              title: 'Sort Order',
              description: 'Sort order',
              example: 'desc',
              default: 'desc'
            })
          })
        },
        responses: {
          200: {
            description: 'Successful response with filtered exercises',
            content: {
              'application/json': {
                schema: ExerciseResponseSchema
              }
            }
          },
          500: {
            description: 'Internal server error'
          }
        }
      }),
      async (ctx) => {
        const {
          offset = 0,
          limit = 10,
          search,
          muscles,
          equipment,
          bodyParts,
          sortBy = 'name',
          sortOrder = 'desc'
        } = ctx.req.valid('query')

        const { origin, pathname } = new URL(ctx.req.url)

        const { totalExercises, totalPages, currentPage, exercises } = await this.exerciseService.filterExercises({
          offset,
          limit,
          search,
          targetMuscles: muscles ? muscles.split(',').map((m) => m.trim()) : undefined,
          equipments: equipment ? equipment.split(',').map((e) => e.trim()) : undefined,
          bodyParts: bodyParts ? bodyParts.split(',').map((b) => b.trim()) : undefined,
          sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
        })

        const queryParams = new URLSearchParams()
        if (search) queryParams.append('search', search)
        if (muscles) queryParams.append('muscles', muscles)
        if (equipment) queryParams.append('equipment', equipment)
        if (bodyParts) queryParams.append('bodyParts', bodyParts)
        queryParams.append('sortBy', sortBy)
        queryParams.append('sortOrder', sortOrder)

        const { previousPage, nextPage } = this.buildPaginationUrls(
          origin,
          pathname,
          currentPage,
          totalPages,
          limit,
          queryParams.toString()
        )

        return ctx.json({
          success: true,
          metadata: {
            totalPages,
            totalExercises,
            currentPage,
            previousPage,
            nextPage
          },
          data: [...exercises]
        })
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/exercises/{exerciseId}',
        tags: ['EXERCISES'],
        summary: 'GetExerciseById',
        operationId: 'getExerciseById',
        request: {
          params: z.object({
            exerciseId: z.string().openapi({
              title: 'Exercise ID',
              description: 'The unique identifier of the exercise to retrieve.',
              type: 'string',
              example: 'ztAa1RK',
              default: 'ztAa1RK'
            })
          })
        },
        responses: {
          200: {
            description: 'Successful response with the exercise details.',
            content: {
              'application/json': {
                schema: z.object({
                  success: z.boolean().openapi({
                    description: 'Indicates whether the request was successful.',
                    type: 'boolean',
                    example: true
                  }),
                  data: ExerciseModel.openapi({
                    description: 'The retrieved exercise details.'
                  })
                })
              }
            }
          },
          404: {
            description: 'Exercise not found'
          },
          500: {
            description: 'Internal server error'
          }
        }
      }),
      async (ctx) => {
        const exerciseId = ctx.req.param('exerciseId')
        const exercise = await this.exerciseService.getExerciseById({ exerciseId })

        return ctx.json({
          success: true,
          data: exercise
        })
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/bodyparts/{bodyPartName}/exercises',
        tags: ['EXERCISES'],
        summary: 'GetExercisesByBodyparts',
        description: 'Retrieve exercises that target a specific body part',
        operationId: 'getExercisesByBodyPart',
        request: {
          params: z.object({
            bodyPartName: z.string().openapi({
              description: 'Body part name (case-insensitive)',
              type: 'string',
              example: 'upper arms',
              default: 'upper arms'
            })
          }),
          query: PaginationQuerySchema
        },
        responses: {
          200: {
            description: 'Successful response with body part-specific exercises',
            content: {
              'application/json': {
                schema: ExerciseResponseSchema
              }
            }
          },
          500: {
            description: 'Internal server error'
          }
        }
      }),
      async (ctx) => {
        const { offset = 0, limit = 10 } = ctx.req.valid('query')
        const bodyPartName = ctx.req.param('bodyPartName')
        const { origin, pathname } = new URL(ctx.req.url)

        const { totalExercises, currentPage, totalPages, exercises } =
          await this.exerciseService.getExercisesByBodyPart({
            offset,
            limit,
            bodyPart: bodyPartName
          })

        const { previousPage, nextPage } = this.buildPaginationUrls(origin, pathname, currentPage, totalPages, limit)

        return ctx.json({
          success: true,
          metadata: {
            totalPages,
            totalExercises,
            currentPage,
            previousPage,
            nextPage
          },
          data: [...exercises]
        })
      }
    )
    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/equipments/{equipmentName}/exercises',
        tags: ['EXERCISES'],
        summary: 'GetExercisesByEquipment',
        description: 'Retrieve exercises that use specific equipment',
        operationId: 'getExercisesByEquipment',
        request: {
          params: z.object({
            equipmentName: z.string().openapi({
              description: 'Equipment name (case-insensitive)',
              type: 'string',
              example: 'dumbbell',
              default: 'dumbbell'
            })
          }),
          query: PaginationQuerySchema
        },
        responses: {
          200: {
            description: 'Successful response with equipment-specific exercises',
            content: {
              'application/json': {
                schema: ExerciseResponseSchema
              }
            }
          },
          500: {
            description: 'Internal server error'
          }
        }
      }),
      async (ctx) => {
        const { offset = 0, limit = 10 } = ctx.req.valid('query')
        const equipmentName = ctx.req.param('equipmentName')
        const { origin, pathname } = new URL(ctx.req.url)

        const { totalExercises, currentPage, totalPages, exercises } =
          await this.exerciseService.getExercisesByEquipment({
            offset,
            limit,
            equipment: equipmentName
          })

        const { previousPage, nextPage } = this.buildPaginationUrls(origin, pathname, currentPage, totalPages, limit)

        return ctx.json({
          success: true,
          metadata: {
            totalPages,
            totalExercises,
            currentPage,
            previousPage,
            nextPage
          },
          data: [...exercises]
        })
      }
    )

    this.controller.openapi(
      createRoute({
        method: 'get',
        path: '/muscles/{muscleName}/exercises',
        tags: ['EXERCISES'],
        summary: 'GetExercisesByMuscle',
        description: 'Retrieve exercises that target a specific muscle',
        operationId: 'getExercisesByMuscle',
        request: {
          params: z.object({
            muscleName: z.string().openapi({
              description: 'Target muscle name (case-insensitive)',
              type: 'string',
              example: 'abs',
              default: 'abs'
            })
          }),
          query: PaginationQuerySchema.extend({
            includeSecondary: z.coerce.boolean().optional().openapi({
              title: 'Include Secondary Muscles',
              description: 'Whether to include exercises where this muscle is a secondary target',
              type: 'boolean',
              example: false,
              default: false
            })
          })
        },
        responses: {
          200: {
            description: 'Successful response with the exercise details.',
            content: {
              'application/json': {
                schema: ExerciseResponseSchema
              }
            }
          },
          500: {
            description: 'Internal server error'
          }
        }
      }),
      async (ctx) => {
        const { offset = 0, limit = 10, includeSecondary = false } = ctx.req.valid('query')
        const muscleName = ctx.req.param('muscleName')
        const { origin, pathname } = new URL(ctx.req.url)
        const { totalExercises, currentPage, totalPages, exercises } = await this.exerciseService.getExercisesByMuscle({
          offset,
          limit,
          muscle: muscleName,
          includeSecondary
        })

        const { previousPage, nextPage } = this.buildPaginationUrls(
          origin,
          pathname,
          currentPage,
          totalPages,
          limit,
          `includeSecondary=${includeSecondary}`
        )

        return ctx.json({
          success: true,
          metadata: {
            totalPages,
            totalExercises,
            currentPage,
            previousPage,
            nextPage
          },
          data: [...exercises]
        })
      }
    )
  }
}
