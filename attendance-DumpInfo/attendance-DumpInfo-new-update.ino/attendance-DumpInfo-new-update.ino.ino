#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiManager.h> 
#include <SPI.h>
#include <MFRC522.h>

#define SS_PIN 5
#define RST_PIN 22
#define RED_LED 14
#define GREEN_LED 12
#define BUZZER 13

MFRC522 rfid(SS_PIN, RST_PIN);

// ডুপ্লিকেট আটকানোর জন্য ভেরিয়েবল
String lastCardUID = "";
unsigned long lastReadTime = 0;
const unsigned long delayBetweenReads = 5000; // ৫ সেকেন্ড বিরতি

const char* serverName = "https://attendance-app-oeht.vercel.app/api/attendance";

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();

  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  WiFiManager wm;
  
  // নতুন আপডেট: প্রতিবার রিস্টার্ট হওয়ার সময় সেভ করা ওয়াইফাই মুছে ফেলবে
  wm.resetSettings(); 
  
  // ওয়াইফাই হটস্পটের নাম পরিবর্তন করে প্রফেশনাল করা হলো
  bool res = wm.autoConnect("Smart_Attendance_System");

  if(!res) {
    Serial.println("Failed to connect");
    ESP.restart();
  } else {
    Serial.println("Connected to WiFi successfully!");
  }
  Serial.println("System Ready. Tap an RFID card...");
}

// সফল অ্যাটেনডেন্স: ১ বার বিপ + গ্রিন লাইট
void successFeedback() {
  digitalWrite(GREEN_LED, HIGH);
  digitalWrite(BUZZER, HIGH); // ১ বার বিপ
  delay(200);
  digitalWrite(BUZZER, LOW);
  delay(800);
  digitalWrite(GREEN_LED, LOW);
}

// ভুল কার্ড বা এরর: ২ বার বিপ + রেড লাইট
void failureFeedback() {
  digitalWrite(RED_LED, HIGH);
  // ২ বার ছোট বিপ
  for(int i=0; i<2; i++) {
    digitalWrite(BUZZER, HIGH);
    delay(150);
    digitalWrite(BUZZER, LOW);
    delay(100);
  }
  delay(500);
  digitalWrite(RED_LED, LOW);
}

// অফলাইন অ্যালার্ট: দীর্ঘ বিপ + রেড লাইট
void offlineAlert() {
  digitalWrite(RED_LED, HIGH);
  digitalWrite(BUZZER, HIGH);
  Serial.println("SYSTEM OFFLINE! Long beep active.");
  // যতক্ষণ নেট আসবে না ততক্ষণ এটি লুপে বাজতে পারে
  delay(1000); 
  digitalWrite(BUZZER, LOW);
}

void loop() {
  // ১. অফলাইন চেক (ইন্টারনেট না থাকলে কার্ড রিড করবে না, শুধু অ্যালার্ট দেবে)
  if (WiFi.status() != WL_CONNECTED) {
    offlineAlert();
    return; // ইন্টারনেট না থাকলে নিচের কোড চলবে না
  } else {
    digitalWrite(RED_LED, LOW); // নেট থাকলে রেড লাইট অফ থাকবে
  }

  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;

  String uidString = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    uidString += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
    uidString += String(rfid.uid.uidByte[i], HEX);
  }
  uidString.toUpperCase();

  unsigned long currentTime = millis();
  
  // ২. ডুপ্লিকেট ট্যাপ চেক (বারবার ট্যাপ করলে ২ বার বিপ দেবে)
  if (uidString == lastCardUID && (currentTime - lastReadTime < delayBetweenReads)) {
    Serial.println("Duplicate tap! Warning student.");
    failureFeedback(); // ২ বার বিপ + রেড লাইট (অ্যাটেনডেন্স কাউন্ট হবে না)
    return; 
  }

  Serial.println("Card Detected! UID: " + uidString);
  lastCardUID = uidString;
  lastReadTime = currentTime;

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String jsonPayload = "{\"uid\":\"" + uidString + "\"}";
  int httpResponseCode = http.POST(jsonPayload);

  if (httpResponseCode == 200) {
    Serial.println("Success: Attendance Logged");
    successFeedback(); 
  } else {
    Serial.print("Error: ");
    Serial.println(httpResponseCode);
    failureFeedback();
  }
  http.end();

  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}