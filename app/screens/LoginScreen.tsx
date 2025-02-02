import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
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
        router.replace("/(tabs)"); // 또는 이동하고 싶은 페이지 경로

        // 성공 메시지 표시 (선택사항)
        Alert.alert("로그인 성공", "환영합니다! 😊");
      } catch (error) {
        console.error("로그인 후 처리 오류:", error);
        Alert.alert("오류", "로그인 후 처리 중 문제가 발생했습니다.");
      }
    }
  }, [response]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.kakaoButton}
        onPress={() => promptAsync()}
      >
        <Text style={styles.buttonText}>카카오로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  kakaoButton: {
    backgroundColor: "#FEE500",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
