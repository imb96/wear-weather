import "dotenv/config";

// app.json의 내용을 가져와서 확장
const config = require("./app.json");

// extra 설정 추가
config.expo.extra = {
  ...config.expo.extra,
  kakaoNativeAppKey: process.env.KAKAO_NATIVE_APP_KEY,
  kakaoRestApiKey: process.env.KAKAO_REST_API_KEY,
};

export default config;
