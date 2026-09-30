const preloadedUrls = new Set<string>();

export class ImageOptimizerService {
  public static cleanExternalUrl(rawUrl: string): string {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    let url = rawUrl.trim();
    if (url.startsWith('http://')) {
      url = 'https://' + url.slice(7);
    }
    return url;
  }

  public static preloadImages(urls: string[]): void {
    if (typeof window === 'undefined') return;
    for (const url of urls) {
      if (!url || preloadedUrls.has(url)) continue;
      preloadedUrls.add(url);
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.decoding = 'async';
      img.src = this.cleanExternalUrl(url);
    }
  }

  public static async testExternalImageUrl(
    url: string,
    timeoutMs = 6000,
  ): Promise<{ ok: boolean; message: string }> {
    return new Promise((resolve) => {
      if (!url) {
        return resolve({ ok: false, message: 'Пустой URL изображения' });
      }
      const clean = this.cleanExternalUrl(url);
      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      const timer = setTimeout(() => {
        resolve({ ok: false, message: `Таймаут загрузки с внешнего сервера (превышено ${timeoutMs / 1000} сек)` });
      }, timeoutMs);

      img.onload = () => {
        clearTimeout(timer);
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          resolve({ ok: false, message: 'Сервер не вернул отображаемое изображение' });
          return;
        }
        resolve({ ok: true, message: `Изображение успешно получено (${img.naturalWidth}x${img.naturalHeight}px)` });
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve({ ok: false, message: 'Внешний сервер заблокировал доступ или ссылка повреждена' });
      };
      img.src = clean;
    });
  }
}
