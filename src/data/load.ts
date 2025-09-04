import { promises as fs } from 'fs'
import path from 'path'
import { Equipment, Exercise, Muscle, BodyPart } from './types'
import { HTTPException } from 'hono/http-exception'

export class FileLoader {
  private static dataPath = path.resolve(process.cwd(), 'src', 'data')

  private static cache = new Map<string, unknown>()

  private static async loadJSON<T>(filename: string): Promise<T> {
    const filePath = path.resolve(this.dataPath, filename)

    if (this.cache.has(filePath)) {
      return this.cache.get(filePath) as T
    }

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8')
      const data = JSON.parse(fileContent) as T
      this.cache.set(filePath, data)
      return data
    } catch (error) {
      console.error(`❌ Error loading JSON file [${filename}]:`, error)
      throw new HTTPException(500, { message: `database not working` })
    }
  }

  public static loadExercises(): Promise<Exercise[]> {
    return this.loadJSON<Exercise[]>(`exercises.json`)
  }

  public static loadEquipments(): Promise<Equipment[]> {
    return this.loadJSON<Equipment[]>('equipments.json')
  }

  public static loadBodyParts(): Promise<BodyPart[]> {
    return this.loadJSON<BodyPart[]>('bodyparts.json')
  }

  public static loadMuscles(): Promise<Muscle[]> {
    return this.loadJSON<Muscle[]>('muscles.json')
  }
}
