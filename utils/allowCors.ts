import type {
  VercelApiHandler,
  VercelRequest,
  VercelResponse,
} from '@vercel/node'

export async function allowCors(handler: VercelApiHandler) {
  return async (request: VercelRequest, response: VercelResponse) => {
    response.setHeader('Access-Control-Allow-Credentials', 'true')
    response.setHeader(
      'Access-Control-Allow-Origin',
      request.headers.origin ?? '*'
    )
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    )
    response.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (request.method === 'OPTIONS') {
      response.status(200).end()

      return
    }

    return await handler(request, response)
  }
}
