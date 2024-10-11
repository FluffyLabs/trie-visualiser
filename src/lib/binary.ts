export const convertHexToBinary = (hexString: string) => {
  return parseInt(hexString, 16).toString(2).padStart(8, "0");
};

export const getPrefixWithFirstDifference = (str1: string, str2: string) => {
  let prefix = "";

  // Iterate through both strings and find the first difference
  for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
    if (str1[i] === str2[i]) {
      prefix += str1[i];
    } else {
      // Include the first different digit from str1 and return
      prefix += str1[i];
      break;
    }
  }

  return prefix;
};
