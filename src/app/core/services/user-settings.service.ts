import { effect, Injectable, signal } from '@angular/core';
import { UserSettings } from '../models/interface/user';

@Injectable({
  providedIn: 'root',
})
export class UserSettingsService {
  #userSettingsSignal = signal<UserSettings | null>(null);

  private readonly DEFAULT_USER_SETTINGS: UserSettings = {
    communityExpanded: true,
    resourcesExpanded: true,
    customFeedExpanded: true,
  };
  private readonly USER_SETTINGS_KEY = 'userSettings';
  userSettings = this.#userSettingsSignal.asReadonly();

  constructor() {
    this.initializeUserSettings();

    effect(() => {
      const userSettings = this.#userSettingsSignal();

      if (userSettings) {
        localStorage.setItem(this.USER_SETTINGS_KEY, JSON.stringify(userSettings));
      }
    });
  }

  private initializeUserSettings(): void {
    const storedSettings = localStorage.getItem(this.USER_SETTINGS_KEY);

    if (storedSettings) {
      const userSettingsParsed = JSON.parse(storedSettings) as UserSettings;
      const mergedSettings = {
        ...this.DEFAULT_USER_SETTINGS,
        ...userSettingsParsed,
      };

      this.#userSettingsSignal.set(mergedSettings);
    } else {
      this.#userSettingsSignal.set(this.DEFAULT_USER_SETTINGS);
    }
  }

  updateUserSettings(settings: Partial<UserSettings>): void {
    this.#userSettingsSignal.update((current) => ({
      ...(current || this.DEFAULT_USER_SETTINGS),
      ...settings,
    }));
  }
}
