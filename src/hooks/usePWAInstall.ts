import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type InstallPlatform = 'ios-safari' | 'ios-other' | 'android' | 'desktop' | 'other';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>('other');

  useEffect(() => {
    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const updateInstalledState = () => {
      setIsInstalled(standaloneQuery.matches || navigatorWithStandalone.standalone === true);
    };
    updateInstalledState();
    if (typeof standaloneQuery.addEventListener === 'function') {
      standaloneQuery.addEventListener('change', updateInstalledState);
    } else {
      standaloneQuery.addListener(updateInstalledState);
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const isSafari = /safari/.test(userAgent) && !/(crios|fxios|edgios|opios)/.test(userAgent);
    setPlatform(
      isIOSDevice
        ? isSafari ? 'ios-safari' : 'ios-other'
        : /android/.test(userAgent)
          ? 'android'
          : /windows|macintosh|linux/.test(userAgent)
            ? 'desktop'
            : 'other',
    );

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (typeof standaloneQuery.removeEventListener === 'function') {
        standaloneQuery.removeEventListener('change', updateInstalledState);
      } else {
        standaloneQuery.removeListener(updateInstalledState);
      }
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS: platform === 'ios-safari' || platform === 'ios-other',
    platform,
    install,
  };
}
