import { handle } from '@hono/node-server/vercel'
import app from '../dist/vercel.js'

export default handle(app)
