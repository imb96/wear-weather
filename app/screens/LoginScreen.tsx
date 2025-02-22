import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import { router } from "expo-router";

// 웹브라우저 결과 자동 종료 설정
WebBrowser.maybeCompleteAuthSession();

// 카카오 인증 설정
const discovery = {
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
  tokenEndpoint: "https://kauth.kakao.com/oauth/token",
};

export default function LoginScreen() {
  const kakaoRestApiKey = Constants.expoConfig?.extra?.kakaoRestApiKey;

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: kakaoRestApiKey,
      scopes: ["profile_nickname"],
      redirectUri: makeRedirectUri({
        scheme: "myapp",
        path: "kakao-auth",
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("인증 코드:", code);

      // 인증 코드로 액세스 토큰 요청
      fetch("https://kauth.kakao.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: kakaoRestApiKey,
          redirect_uri: makeRedirectUri({
            scheme: "myapp",
            path: "kakao-auth",
          }),
          code: code,
        }).toString(),
      })
        .then((res) => res.json())
        .then((tokenData) => {
          console.log("토큰 데이터:", tokenData);

          // 액세스 토큰으로 사용자 정보 요청
          fetch("https://kapi.kakao.com/v2/user/me", {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          })
            .then((res) => res.json())
            .then((userData) => {
              console.log("사용자 닉네임:", userData.properties.nickname);
            })
            .catch((error) => {
              console.error("사용자 정보 요청 실패:", error);
            });
        })
        .catch((error) => {
          console.error("토큰 요청 실패:", error);
        });

      try {
        // 메인 페이지로 이동
        router.replace("/(tabs)");
        Alert.alert("로그인 성공", "환영합니다! 😊");
      } catch (error) {
        console.error("로그인 후 처리 오류:", error);
        Alert.alert("오류", "로그인 후 처리 중 문제가 발생했습니다.");
      }
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/weather-bg.jpg")}
        style={styles.backgroundImage}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>오늘의 날씨</Text>
        <Text style={styles.subtitle}>
          날씨에 맞는{"\n"}스타일링을 추천해드려요
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.kakaoButton}
          onPress={() => promptAsync()}
        >
          <Text style={styles.buttonText}>카카오로 시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#FFFFFF",
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
