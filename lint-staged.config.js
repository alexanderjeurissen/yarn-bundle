module.exports = {
  "*.ts": (filenames) =>
    filenames.map((filename) => `eslint_d --fix ${filename}`),
};
