export type PersonaState =
  | "happy"
  | "content"
  | "neutral"
  | "worried"
  | "stressed";

export type ThemeMode = "dark" | "light" | "oled";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
