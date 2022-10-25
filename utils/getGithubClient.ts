import { Octokit } from '@octokit/rest'

export async function getGithubClient() {
  try {
    const client = new Octokit({
      auth: process.env.GITHUB_AUTH_TOKEN,
    })

    const { data: rateLimitInfo } = await client.rest.rateLimit.get()

    if (rateLimitInfo.rate.remaining === 0) {
      console.warn(
        `Github rate limit exceeded, reset is in ${rateLimitInfo.rate.reset}`
      )

      return null
    }

    return client
  } catch (err) {
    console.error(`Error getting Github client: ${err.message}`)

    return null
  }
}
