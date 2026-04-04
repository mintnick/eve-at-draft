import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function ensureExists(relativePath: string): Promise<void> {
  const absolutePath = path.resolve(__dirname, '..', relativePath)
  await access(absolutePath)
}

async function main(): Promise<void> {
  await Promise.all([
    ensureExists('data/raw'),
    ensureExists('data/generated'),
    ensureExists('docs/refactor-plan.md'),
    ensureExists('docs/refactor-todo.md'),
    ensureExists('tools/data-pipeline/cli.ts'),
  ])

  console.log('Tooling baseline verified.')
}

main().catch((error: unknown) => {
  console.error('Tooling validation failed.')
  console.error(error)
  process.exit(1)
})
