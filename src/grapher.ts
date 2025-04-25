type GraphColor = {
	a: number
	rgb: number
}

type GraphNode = {
	type: string
	links?: Record<string, boolean>
	color?: GraphColor
	childColorSet?: boolean
}

export type DataEngine = {
	renderer: Renderer
	searchQueries: SearchQueries[]
}

type NodeDataArg = { nodes: Record<string, GraphNode> }

export interface Renderer {
	setData(data: NodeDataArg, ...args: unknown[]): void
	[symSetDataOg]?: Renderer['setData']
}

export const symSetDataOg = Symbol('The original setData func')

type Matcher = {
	matchedTokens: {
		type: string
		content: string
	}[]
} & (
	| {
			matcher: { text: string }
	  }
	| {
			matchers: Matcher[]
	  }
)

export type SearchQueries = { query: { matcher: Matcher }; color: GraphColor }

function matchTag(m: Matcher, tag: string): boolean {
	if ('matcher' in m) {
		return m.matcher.text == tag
	}

	for (let i = 0; i < m.matchedTokens.length; i++) {
		const tok = m.matchedTokens[i]
		if (tok.type == 'text' && tok.content != 'tag') return false
	}

	if ('matchers' in m) {
		for (let i = 0; i < m.matchers.length; i++) {
			const tmp = m.matchers[i]
			if (i % 2 == 1) {
				if (!('text' in tmp) || tmp.text != 'or') return false
				continue
			}

			if (matchTag(tmp, tag)) return true
		}
	}

	return false
}

export function customSetData(
	{ nodes }: NodeDataArg,
	searchQueries: SearchQueries[]
): NodeDataArg['nodes'] {
	// name -> files that link to it
	const allLinks: Record<string, Set<string>> = {}

	const addLink = function (a: string, b: string) {
		if (!allLinks[a]) {
			allLinks[a] = new Set([b])
		} else {
			allLinks[a].add(b)
		}
	}

	for (const name in nodes) {
		const n = nodes[name]
		if (!n.color) {
			if (n.type == 'tag') {
				const matchedSearch = searchQueries
					.slice(1)
					.find((q) => matchTag(q.query.matcher, name))
				if (matchedSearch) {
					nodes[name].color = matchedSearch.color
				}
			}
		}

		for (const linkedName in n.links ?? {}) {
			addLink(linkedName, name)
			addLink(name, linkedName)
		}
	}

	for (const name in nodes) {
		const n = nodes[name]

		if (n.color || !allLinks[name]) continue
		const colorMap: Map<number, number> = new Map()

		allLinks[name].forEach((linkedNode) => {
			const c = nodes[linkedNode].color
			if (c && !nodes[linkedNode].childColorSet) {
				colorMap.set(c.rgb, (colorMap.get(c.rgb) ?? 0) + 1)
			}
		})

		let bestColor = 0
		let bestColorCount = 0

		colorMap.forEach((v, k) => {
			if (v > bestColorCount) {
				bestColor = k
				bestColorCount = v
			}
		})

		nodes[name].color = { a: 1, rgb: bestColor }
		nodes[name].childColorSet = true
	}

	return nodes
}
