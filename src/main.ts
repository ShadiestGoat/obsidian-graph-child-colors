import type { View } from 'obsidian'
import { Plugin } from 'obsidian'
import { customSetData, symSetDataOg, type DataEngine } from './grapher'

export default class GraphChildColors extends Plugin {
	async onload(): Promise<void> {
		this.registerEvent(
			this.app.workspace.on('layout-change', () => {
				this.refreshCurrrentGraphViews()
			})
		)

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (l) => {
				if (!l) return
				if (l.view.getViewType() != 'graph') return

				this.loadGraphModForView(l.view)
			})
		)

		this.app.workspace.onLayoutReady(() => {
			this.refreshCurrrentGraphViews()
		})
	}

	refreshCurrrentGraphViews() {
		this.app.workspace.getLeavesOfType('graph').forEach((l) => {
			this.loadGraphModForView(l.view)
		})
	}

	loadGraphModForView(v: View) {
		if (!v || !('renderer' in v)) {
			console.log('No renderer :?')
			return
		}

		const cleanup = this.possiblyLoadGraphMod(
			(v as unknown as { dataEngine: DataEngine }).dataEngine
		)
		if (cleanup) {
			this.register(cleanup)
		}
	}

	possiblyLoadGraphMod(de: DataEngine): (() => void) | null {
		const r = de.renderer
		if (r[symSetDataOg]) return null

		r[symSetDataOg] = r.setData
		r.setData = function (d, ...args) {
			d.nodes = customSetData(d, de.searchQueries)
			r[symSetDataOg]!(d, ...args)
		}

		return () => {
			if (!r?.[symSetDataOg]) return
			r.setData = r[symSetDataOg]
			delete r[symSetDataOg]
		}
	}
}
