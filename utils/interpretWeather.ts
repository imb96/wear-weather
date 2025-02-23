export const interpretWeather = (category: string, value: string) => {
  switch (category) {
    case "PTY": // 강수형태
      const ptyCode =
        {
          "0": "없음",
          "1": "비",
          "2": "비/눈",
          "3": "눈",
          "4": "소나기",
        }[value] || value;
      return `강수: ${ptyCode}`;

    case "REH": // 습도
      return `습도: ${value}%`;

    case "RN1": // 1시간 강수량
      return `강수량: ${value}mm`;

    case "T1H": // 기온
      return `기온: ${value}°C`;

    case "WSD": // 풍속
      return `풍속: ${value}m/s`;

    default:
      return null;
  }
};
