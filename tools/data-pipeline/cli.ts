import { buildTournamentArtifacts } from './build'
import { getTournamentConfig } from './config'
import { fetchTournamentSource } from './fetch'
import { validateTournamentArtifacts } from './validate'

async function main() {
  const command = process.argv[2]
  const yearArg = process.argv[3] ?? '2025'
  const year = Number(yearArg)

  if (!Number.isInteger(year)) {
    throw new Error(`Invalid tournament year: ${yearArg}`)
  }

  getTournamentConfig(year)

  if (command === 'fetch') {
    await fetchTournamentSource(year)
    return
  }

  if (command === 'build') {
    await buildTournamentArtifacts(year)
    return
  }

  if (command === 'validate') {
    await validateTournamentArtifacts(year)
    return
  }

  if (command === 'refresh') {
    await fetchTournamentSource(year)
    await buildTournamentArtifacts(year)
    await validateTournamentArtifacts(year)
    return
  }

  throw new Error(`Unknown pipeline command: ${command}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
