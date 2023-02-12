import { VercelRequest, VercelResponse } from '@vercel/node'
import { StatusCodes } from 'http-status-codes'

import { allowCors, getGithubClient } from '../utils'

interface IIssue {
  readonly email: string
  readonly title: string
  readonly body: string
}

const REQUIRED_FIELDS = ['email', 'title', 'body']

export default allowCors(async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    if (request.method !== 'POST') {
      response.status(StatusCodes.METHOD_NOT_ALLOWED).end()

      return
    }

    const requestBody: IIssue = request.body

    if (requestBody == null) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: '`email` `title` and `body` are required' })

      return
    }

    for (const field of REQUIRED_FIELDS) {
      const missing = REQUIRED_FIELDS.filter(
        (field) => requestBody[field] == null
      )
        .map((field) => `\`${field}\``)
        .join(' ')

      if (requestBody[field] == null) {
        response
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: `${missing} are required` })

        return
      }
    }

    const client = await getGithubClient()

    // TODO: This won't *really* always mean too many requests
    if (client == null) {
      response.status(StatusCodes.TOO_MANY_REQUESTS)

      return
    }

    const issue = await client.issues.create({
      owner: 'crcarrick',
      repo: 'reawr',
      title: requestBody.title,
      body: `${requestBody.email}:

${requestBody.body}
      `,
    })

    response.status(StatusCodes.OK).json({
      url: issue.data.url,
    })
  } catch (err) {
    console.error(`Error in /suggestion ${err.message}`)

    response.status(StatusCodes.INTERNAL_SERVER_ERROR).end()
  }
})
