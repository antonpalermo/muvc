import { createExecutionContext, waitOnExecutionContext } from 'cloudflare:test'
import { describe, it } from "vitest";
import { env } from 'cloudflare:workers';

import app from '../worker/index.ts'

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>

export async function invokeWorker(request: Request) {
    const ctx = createExecutionContext()
    const response = await app.fetch(request, env, ctx)
    await waitOnExecutionContext(ctx)

    return response
}

describe("index", () => {
    it('response should be 200 OK', async ({ expect }) => {
        const request = new IncomingRequest('http://example.com/status')
        const response = await invokeWorker(request)

        expect(response.status).toBe(200)
    })

    it('content-type should be application/json', async ({ expect }) => {
        const request = new IncomingRequest('http://example.com/status')
        const response = await invokeWorker(request)

        expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('body should contain a message', async ({ expect }) => {
        const request = new IncomingRequest('http://example.com/status')
        const response = await invokeWorker(request)

        expect(await response.json()).toHaveProperty("message")
    })
})