import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

export function resolveRepoPath(...segments: string[]) {
  return path.resolve(repoRoot, ...segments)
}

export async function readJsonFile<T>(...segments: string[]): Promise<T> {
  const absolutePath = resolveRepoPath(...segments)
  const file = await readFile(absolutePath, 'utf8')
  return JSON.parse(file) as T
}

export async function writeJsonFile(value: unknown, ...segments: string[]): Promise<void> {
  const absolutePath = resolveRepoPath(...segments)
  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}
