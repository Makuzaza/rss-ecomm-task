// eslint-disable-next-line no-undef
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [
      2,
      "never",
      ["pascal-case", "camel-case", "kebab-case", "upper-case", "snake-case"],
    ],
  },
};
