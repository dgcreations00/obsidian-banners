import { requestUrl } from 'obsidian';
import { IMAGE_EXTENSIONS } from 'src/bannerData';
import { plug } from 'src/main';

const FILE_REGEX = /^\[\[.+\]\]$/;
const HTTP_URL_REGEX = /^https?:\/\//;
const imageCache: Record<string, string> = {};

const getInternalImage = (link: string, currentPath: string) => {
  const file = plug.app.metadataCache.getFirstLinkpathDest(link.slice(2, -2), currentPath);
  if (!file) {
    throw new Error(`${link} file does not exist!`);
  } else if (!IMAGE_EXTENSIONS.includes(file.extension)) {
    throw new Error(`${file.name} is not an image!`);
  }

  const resourcePath = plug.app.vault.getResourcePath(file);
  imageCache[file.path] = resourcePath;
  return resourcePath;
};

const getRemoteImage = async (src: string) => {
  try {
    // Error out if the string isn't a valid URL
    new URL(src);

    const resp = await requestUrl(src);
    const blob = new Blob([resp.arrayBuffer], { type: resp.headers['content-type'] });
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        imageCache[src] = result;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to fetch image from "${src}"!`);
  }
};



export const fetchImage = async (src: any, currentPath: string): Promise<string | null> => {
  if (
    Array.isArray(src) &&
        src.length === 1 &&
        Array.isArray(src[0]) &&
        src[0].length === 1 &&
        typeof src[0][0] === 'string'
  ) {
    src = `[[${src[0][0]}]]`;
  }

  if (typeof src !== 'string' || !src) {
    return null;
  }

  if (imageCache[src]) return imageCache[src];

  if (FILE_REGEX.test(src)) {
    return getInternalImage(src, currentPath);
  }

  if (HTTP_URL_REGEX.test(src)) {
    return getRemoteImage(src);
  }

  try {
    const file = plug.app.metadataCache.getFirstLinkpathDest(src, currentPath);
    if (!file) {
      throw new Error(`File not found for banner: ${src}`);
    } else if (!IMAGE_EXTENSIONS.includes(file.extension)) {
      throw new Error(`${file.name} is not an image!`);
    }
    const resourcePath = plug.app.vault.getResourcePath(file);
    imageCache[src] = resourcePath;
    return resourcePath;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const flushImageCache = () => {
  for (const key in imageCache) delete imageCache[key];
};
