import { Hono } from 'hono'

export type HonoBindings = {
  Bindings: Env
}

const app = new Hono<HonoBindings>()

app.get('/status', (ctx) => {
  return ctx.json({ message: 'sample' })
})

export default app
