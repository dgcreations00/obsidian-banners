<script lang="ts">
  import { settings } from 'src/settings/store';

  export let error: string;
  $: ({ frontmatterField } = $settings);
</script>

<div class="wrapper">
  <div class="error markdown-rendered">
    <p>Couldn't load the banner! Is the <code>{frontmatterField}</code> field correct?</p>
    <code>{error}</code>
  </div>
</div>

<style lang="scss">
	@use './mixins.scss';

	.wrapper {
	@include mixins.info-box-wrapper;

	:global(.obsidian-banner-wrapper) & { height: var(--banners-height); }
	:global(.is-mobile .obsidian-banner-wrapper) & { height: var(--banners-mobile-height); }
	:global(.obsidian-banner-wrapper.in-popover) & { height: var(--banners-popover-height); }
	:global(.obsidian-banner-wrapper.in-internal-embed) & {
	height: var(--banners-internal-embed-height);
	}
	}
	.error {
	@include mixins.info-box;
	border-color: var(--background-modifier-error);
	color: var(--text-error);
	}
</style>
