/* eslint-disable @typescript-eslint/no-this-alias */
import { Plugin } from 'obsidian';
import { unloadAllBanners } from './banner';
import BannerEvents from './BannerEvents';
import loadCommands from './commands';
import { loadExtensions } from './editing';
import { loadPostProcessor } from './reading';
import { loadSettings } from './settings';
import { unsetCssVars } from './settings/CssSettingsHandler';
import type { BannerSettings } from './settings/structure';

export let plug: BannersPlugin;

export default class BannersPlugin extends Plugin {
  settings!: BannerSettings;
  events!: BannerEvents;

  async onload() {    
    plug = this;
    this.events = new BannerEvents();

    await loadSettings();

    this.app.workspace.onLayoutReady(() => {
      const startTime = performance.now();
      console.log('Banners plugin: onload started');

      loadPostProcessor();
      loadExtensions();
      loadCommands();
      this.events.loadEvents();

      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;

      console.log(`Banners plugin: setup complete in ${durationInSeconds.toFixed(3)}s`);
    });
  }

  async onunload() {
    unloadAllBanners();
    unsetCssVars();
  }
}