import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { convertToGridCoord } from "@/utils/convertToGridCoord";
import { getBaseDateTime } from "@/utils/getBaseDateTime";
import { interpretWeather } from "@/utils/interpretWeather";

interface WeatherItem {
  category: string;
  obsrValue: string;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [weatherData, setWeatherData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("위치 확인 중...");

  useEffect(() => {
    (async () => {
      try {
        // 1. 위치 권한 얻기
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log("status", JSON.stringify(status));
        if (status !== "granted") {
          setErrorMsg("위치 접근 권한이 필요합니다");
          return;
        }

        // 2. 현재 위치 가져오기
        const location = await Location.getCurrentPositionAsync({});
        console.log("location", JSON.stringify(location));
        setLocation(location);

        // 3. 위경도를 기상청 좌표로 변환
        const { nx, ny } = convertToGridCoord(
          location.coords.latitude,
          location.coords.longitude
        );
        console.log("nx", nx);
        console.log("ny", ny);

        const result = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log("result", JSON.stringify(result));
        if (result[0]) {
          const addressComponents = [
            result[0].district,
            result[0].street,
            result[0].subregion,
            result[0].city,
          ].filter(Boolean); // null, undefined 값 제거

          setAddress(addressComponents.join(" "));
        }

        // 4. 현재 시간 정보 가져오기
        const { base_date, base_time } = getBaseDateTime();

        // 5. API 호출
        const serviceKey =
          "f89AhZfbwnKypAIk4KiLXN12k2roT4Wc%2BMs%2FMsOHSDkHEVGbF31tgRAbyEothSD%2BlyXCcP4gCdx%2BatBr5FnykQ%3D%3D"; // 공공데이터 포털에서 받은 인증키
        const response = await fetch(
          `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?` +
            `serviceKey=${serviceKey}&` +
            `pageNo=1&` +
            `numOfRows=1000&` +
            `dataType=JSON&` +
            `base_date=${base_date}&` +
            `base_time=${base_time}&` +
            `nx=${nx}&` +
            `ny=${ny}`
        );

        const data = await response.json();
        setWeatherData(data);
        console.log("날씨 데이터:", data);
      } catch (error) {
        setErrorMsg("날씨 정보를 가져오는데 실패했습니다");
        console.error("에러:", error);
      }
    })();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.weatherContainer}>
        {errorMsg ? (
          <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
        ) : weatherData ? (
          <>
            <ThemedText style={styles.locationText}>{address}</ThemedText>
            <ThemedText style={styles.timeText}>
              {new Date().toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
            <ThemedView style={styles.weatherGrid}>
              {weatherData.response.body.items.item
                .map((item: WeatherItem) =>
                  interpretWeather(item.category, item.obsrValue)
                )
                .filter((text: string) => text !== null)
                .map((text: string, index: number) => (
                  <ThemedView key={index} style={styles.weatherItem}>
                    <ThemedText style={styles.weatherText}>{text}</ThemedText>
                  </ThemedView>
                ))}
            </ThemedView>
          </>
        ) : (
          <ThemedText style={styles.loadingText}>
            날씨 정보를 불러오는 중...
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#98D8EF",
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  weatherContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    // backgroundColor: "#A1E3F9",
  },
  locationText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  timeText: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 20,
    textAlign: "center",
  },
  weatherGrid: {
    backgroundColor: "inherit",
    gap: 16,
  },
  weatherItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
  },
  weatherText: {
    fontSize: 18,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
