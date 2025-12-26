import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  I18nManager,
} from "react-native";

I18nManager.forceRTL(true);

type City = {
  name: string;
  lat: number;
  lon: number;
};

const cities: City[] = [
  { name: "بشار", lat: 30.5102939, lon: -2.8125926 },
  { name: "الجزائر العاصمة", lat: 36.7525, lon: 3.04197 },
  { name: "وهران", lat: 35.6971, lon: -0.6359 },
  { name: "قسنطينة", lat: 36.365, lon: 6.6147 },
];

const toMinutes = (t: string): number => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const formatTime = (m: number): string => {
  m = (m + 1440) % 1440;
  return (
    String(Math.floor(m / 60)).padStart(2, "0") +
    ":" +
    String(m % 60).padStart(2, "0")
  );
};

export default function Home() {
  const [maghrib, setMaghrib] = useState("");
  const [fajr, setFajr] = useState("");
  const [result, setResult] = useState("النتيجة ستظهر هنا");

  const fetchTimes = async () => {
    const city = cities[0]; // بشار افتراضيًا
    const today = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timings/${today}?latitude=${city.lat}&longitude=${city.lon}&method=3`
      );
      const json = await res.json();

      const mgh = maghrib || json.data.timings.Maghrib;
      const fjr = fajr || json.data.timings.Fajr;

      let m1 = toMinutes(mgh);
      let m2 = toMinutes(fjr);
      if (m2 <= m1) m2 += 1440;

      const night = m2 - m1;
      const lastThirdStart = m2 - night / 3;

      setResult(
        `المغرب: ${mgh}\n` +
          `الفجر: ${fjr}\n\n` +
          `يبدأ الثلث الأخير عند\n` +
          `${formatTime(lastThirdStart)}\n` +
          `وينتهي عند\n` +
          `${formatTime(m2)}`
      );
    } catch {
      setResult("حدث خطأ في جلب البيانات");
    }
  };

  useEffect(() => {
    fetchTimes();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>الثلث الأخير من الليل</Text>

        <Text style={styles.label}>المغرب (اختياري للتعديل)</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          placeholderTextColor="#94a3b8"
          value={maghrib}
          onChangeText={setMaghrib}
        />

        <Text style={styles.label}>الفجر (اختياري للتعديل)</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          placeholderTextColor="#94a3b8"
          value={fajr}
          onChangeText={setFajr}
        />

        <TouchableOpacity style={styles.button} onPress={fetchTimes}>
          <Text style={styles.buttonText}>احسب الآن</Text>
        </TouchableOpacity>

        <View style={styles.result}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      </View>

      <Text
        style={styles.link}
        onPress={() => Linking.openURL("https://dya-quran.web.app")}
      >
        Quran Web
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    width: "90%",
    maxWidth: 360,
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  title: {
    color: "#e5e7eb",
    textAlign: "center",
    fontSize: 18,
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#020617",
    color: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 6,
  },

  button: {
    marginTop: 20,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },

  result: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#020617",
  },

  resultText: {
    color: "#e5e7eb",
    textAlign: "center",
    lineHeight: 22,
  },

  link: {
    position: "absolute",
    bottom: 20,
    fontSize: 12,
    color: "#94a3b8",
  },
});
