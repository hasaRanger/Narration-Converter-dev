export function padNumber(n, width = 6) {
  return String(n).padStart(width, "0");
}

export function makeProblemId(sourceIdNumber) {
  return `prob_${padNumber(sourceIdNumber)}`;
}

export function makeVariantId(problemId, language, storyId) {
  return `${problemId}_${language}_${storyId}`;
}
