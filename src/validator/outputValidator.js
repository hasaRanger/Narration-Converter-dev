export function validateOutputRecord(record) {
  const mustHave = ["problemId", "source", "original", "difficulty", "topic", "bloom", "examples", "constraints", "test_cases", "variants"];
  for (const key of mustHave) {
    if (record[key] === undefined || record[key] === null) {
      throw new Error(`Missing field '${key}' in output for problemId=${record.problemId}`);
    }
  }
}
