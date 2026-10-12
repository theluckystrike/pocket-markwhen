import { Platform, TextFileView, type WorkspaceLeaf } from 'obsidian';
import type PocketMarkwhenPlugin from './main';
import { TimelinePanel } from './panel';

export const VIEW_ID = 'pocket-markwhen-timeline';
export class PocketMarkwhenView extends TextFileView {
	private sourceEl: HTMLTextAreaElement;
	private timelineEl: HTMLElement;
	private panel: TimelinePanel | null = null;
	private timelineButton: HTMLButtonElement;
	private sourceButton: HTMLButtonElement;
	constructor(leaf: WorkspaceLeaf, private plugin: PocketMarkwhenPlugin) {
		super(leaf);
		this.contentEl.addClass('pocket-markwhen-view');
		this.contentEl.toggleClass('pocket-markwhen-mobile', Platform.isMobile);
		const tabs = this.contentEl.createDiv({ cls: 'pocket-markwhen-tabs', attr: { role: 'tablist', 'aria-label': 'Markwhen view' } });
		this.timelineButton = tabs.createEl('button', { text: 'Timeline', attr: { role: 'tab' } });
		this.sourceButton = tabs.createEl('button', { text: 'Source', attr: { role: 'tab' } });
		const save = tabs.createEl('button', { text: 'Save source' });
		this.timelineEl = this.contentEl.createDiv();
		this.sourceEl = this.contentEl.createEl('textarea', { cls: 'pocket-markwhen-source', attr: { 'aria-label': 'Markwhen source', spellcheck: 'false' } });
		this.sourceEl.addEventListener('input', () => { this.data = this.sourceEl.value; this.requestSave(); });
		this.timelineButton.addEventListener('click', () => this.showTab(false));
		this.sourceButton.addEventListener('click', () => this.showTab(true));
		save.addEventListener('click', () => { void this.save(); });
		this.showTab(false);
	}
	getViewType(): string { return VIEW_ID; }
	getDisplayText(): string { return this.file?.basename ?? 'Pocket Markwhen'; }
	getIcon(): string { return 'calendar-range'; }
	getViewData(): string { return this.sourceEl.value; }
	setViewData(data: string, clear: boolean): void {
		if (clear) this.clear();
		this.data = data; this.sourceEl.value = data;
		this.renderTimeline();
	}
	clear(): void {
		this.data = ''; this.sourceEl.value = '';
		if (this.panel) { this.removeChild(this.panel); this.panel = null; }
		this.timelineEl.empty();
	}
	showTab(source: boolean): void {
		this.contentEl.toggleClass('pocket-markwhen-mobile', Platform.isMobile);
		this.sourceEl.hidden = !source; this.timelineEl.hidden = source;
		this.sourceButton.setAttribute('aria-selected', String(source));
		this.timelineButton.setAttribute('aria-selected', String(!source));
		if (!source) this.renderTimeline();
	}
	private renderTimeline(): void {
		if (this.panel) this.removeChild(this.panel);
		this.timelineEl.empty();
		this.panel = this.addChild(new TimelinePanel(this.timelineEl.createDiv(), this.plugin, [{ source: this.sourceEl.value, path: this.file?.path ?? '' }]));
	}
}
