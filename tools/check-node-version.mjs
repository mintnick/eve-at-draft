const minimumByMajor = new Map([
  [20, [20, 19, 0]],
  [22, [22, 12, 0]],
])

const [major, minor, patch] = process.versions.node.split('.').map(Number)

const isSupported =
  (minimumByMajor.has(major) &&
    compareVersions([major, minor, patch], minimumByMajor.get(major)) >= 0) ||
  major > 22

if (!isSupported) {
  console.error(
    `This project requires Node ^20.19.0 or >=22.12.0. Current version: ${process.version}.\n` +
      'Older Node versions can fail during Vite builds with "crypto.hash is not a function".',
  )
  process.exit(1)
}

function compareVersions(left, right) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index]
    }
  }

  return 0
}
