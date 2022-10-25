import { VercelRequest, VercelResponse } from '@vercel/node'
import { StatusCodes } from 'http-status-codes'

import { getGithubClient } from '../utils'

interface IIssue {
  readonly title: string
  readonly body: string
}

export default async function (
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    if (request.method !== 'POST')
      return response.status(StatusCodes.METHOD_NOT_ALLOWED)

    const requestBody: IIssue = request.body

    if (requestBody == null)
      return response
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: '`title` and `body` are required' })
    if (requestBody.title == null)
      return response
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: '`title` is required' })
    if (requestBody.body == null)
      return response
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: '`body` is required' })

    const client = await getGithubClient()

    // TODO: This won't *really* always mean too many requests
    if (client == null) return response.status(StatusCodes.TOO_MANY_REQUESTS)

    const issue = await client.issues.create({
      owner: 'crcarrick',
      repo: 'reawr',
      title: requestBody.title,
      body: requestBody.body,
    })

    return response.status(StatusCodes.OK).json({
      url: issue.data.url,
    })
  } catch (err) {
    console.error(`Error in /suggestion ${err.message}`)

    return response.status(StatusCodes.INTERNAL_SERVER_ERROR)
  }
}
