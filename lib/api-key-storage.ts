export const ApiKeyStorage = {
  KEY: "fireworks_api_key",

  save(key: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.KEY, key)
  },

  get(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(this.KEY)
  },

  remove(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.KEY)
  },

  validate(key: string): { valid: boolean; error?: string } {
    if (!key || key.trim().length === 0) {
      return { valid: false, error: "API key cannot be empty" }
    }

    if (!key.startsWith("fw_")) {
      return { valid: false, error: 'Fireworks API key must start with "fw_"' }
    }

    if (key.length < 20) {
      return { valid: false, error: "API key appears to be too short" }
    }

    return { valid: true }
  },
}
