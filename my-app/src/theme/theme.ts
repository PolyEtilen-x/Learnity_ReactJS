export const AppColors = {
  background: "#A0EACF",
  backgroundSecond: "#0F2A19",

  buttonBg: "#0F2A19",
  buttonBgProfile: "#9EB9A8",

  textPrimary: "#000000",
  textSecondary: "#6C6C6C",
  textThird: "#A5AFA8",

  buttonText: "#A0EACF",
  white: "#FFFFFF",
  black: "#000000",
  buttonEditProfile: "#0F2A19",

  darkBackground: "#0F2A19",
  darkBackgroundSecond: "#A0EACF",

  darkButtonBg: "#2C2C2C",
  darkButtonBgProfile: "#3A3A3A",

  darkTextPrimary: "#FFFFFF",
  darkTextSecondary: "#B0B0B0",
  darkTextThird: "#8E8E8E",

  darkButtonText: "#00FFB3",
};

export const AppTextStyles = {
  title: (isDark: boolean) => ({
    fontSize: "40px",
    fontWeight: 900,
    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
  }),
  subtitle: (isDark: boolean) => ({
    fontSize: "25px",
    fontWeight: 800,
    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
  }),
  subtitle2: (isDark: boolean) => ({
    fontSize: "22px",
    fontWeight: 700,
    color: isDark ? AppColors.darkTextThird : AppColors.textThird,
  }),
  body: (isDark: boolean) => ({
    fontSize: "16px",
    fontWeight: "normal",
    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
  }),
  bodySecondary: (isDark: boolean) => ({
    fontSize: "14px",
    fontWeight: "normal",
    color: isDark ? AppColors.darkTextSecondary : AppColors.textSecondary,
  }),
  caption: (isDark: boolean) => ({
    fontSize: "12px",
    fontWeight: 400,
    color: isDark ? AppColors.darkTextThird : AppColors.textThird,
  }),
  textButton: (isDark: boolean) => ({
    fontSize: "17px",
    fontWeight: 600,
    color: isDark ? AppColors.darkButtonText : AppColors.buttonText,
  }),
  label: (isDark: boolean) => ({
    fontSize: "16px",
    fontWeight: 700,
    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
  }),
  hint: (isDark: boolean) => ({
    fontSize: "16px",
    fontStyle: "italic",
    color: isDark
      ? AppColors.darkTextSecondary + "99"
      : AppColors.textSecondary + "99",
  }),
  link: (isDark: boolean) => ({
    fontSize: "15px",
    fontWeight: 500,
    color: isDark ? "#ADD8E6" : "blue",
    textDecoration: "underline",
  }),
  error: () => ({
    fontSize: "14px",
    fontWeight: 500,
    color: "red",
  }),
  placeholder: (isDark: boolean) => ({
    fontSize: "15px",
    color: isDark ? AppColors.darkTextThird : AppColors.textThird,
  }),
  inputText: (isDark: boolean) => ({
    fontSize: "16px",
    fontWeight: 500,
    color: isDark ? AppColors.darkTextPrimary : AppColors.textPrimary,
  }),
};

export const AppBackgroundStyles = {
  mainBackground: (isDark: boolean) =>
    isDark ? AppColors.darkBackground : AppColors.background,
  secondaryBackground: (isDark: boolean) =>
    isDark ? AppColors.darkBackgroundSecond : AppColors.backgroundSecond,
  footerBackground: (isDark: boolean) =>
    isDark ? AppColors.background : AppColors.darkBackground,
};
